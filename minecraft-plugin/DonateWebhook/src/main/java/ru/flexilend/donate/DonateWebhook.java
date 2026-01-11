package ru.flexilend.donate;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import net.luckperms.api.LuckPerms;
import net.luckperms.api.LuckPermsProvider;
import net.luckperms.api.model.user.User;
import net.luckperms.api.node.Node;
import org.bukkit.Bukkit;
import org.bukkit.plugin.java.JavaPlugin;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;

public class DonateWebhook extends JavaPlugin {
    
    private HttpServer server;
    private LuckPerms luckPerms;
    private String secretKey;
    private int port;
    
    // Конфигурация пакетов для каждого режима
    private final Map<String, Map<String, PackageConfig>> packages = new HashMap<>();
    
    @Override
    public void onEnable() {
        // Сохраняем конфиг по умолчанию
        saveDefaultConfig();
        
        // Загружаем настройки
        port = getConfig().getInt("webhook.port", 8080);
        secretKey = getConfig().getString("webhook.secret", "");
        
        // Подключаемся к LuckPerms
        try {
            luckPerms = LuckPermsProvider.get();
            getLogger().info("LuckPerms подключен!");
        } catch (IllegalStateException e) {
            getLogger().severe("LuckPerms не найден! Плагин будет отключен.");
            getServer().getPluginManager().disablePlugin(this);
            return;
        }
        
        // Загружаем конфигурацию пакетов
        loadPackages();
        
        // Запускаем HTTP сервер для приема webhook
        try {
            startWebhookServer();
            getLogger().info("Webhook сервер запущен на порту " + port);
        } catch (IOException e) {
            getLogger().log(Level.SEVERE, "Не удалось запустить webhook сервер!", e);
            getServer().getPluginManager().disablePlugin(this);
        }
    }
    
    @Override
    public void onDisable() {
        if (server != null) {
            server.stop(0);
            getLogger().info("Webhook сервер остановлен");
        }
    }
    
    private void loadPackages() {
        // Survival режим
        Map<String, PackageConfig> survival = new HashMap<>();
        survival.put("beginner", new PackageConfig("beginner", 
            List.of("essentials.kit.beginner"), 
            "§aВы получили донат-пакет §eНовичок§a!"));
        survival.put("premium", new PackageConfig("premium", 
            List.of("essentials.kit.premium", "essentials.fly"), 
            "§aВы получили донат-пакет §6Премиум§a!"));
        survival.put("vip", new PackageConfig("vip", 
            List.of("essentials.kit.vip", "essentials.fly", "essentials.god"), 
            "§aВы получили донат-пакет §bVIP§a!"));
        survival.put("legend", new PackageConfig("legend", 
            List.of("essentials.kit.legend", "essentials.fly", "essentials.god", "worldedit.*"), 
            "§aВы получили донат-пакет §5Легенда§a!"));
        
        // Anarchy режим
        Map<String, PackageConfig> anarchy = new HashMap<>();
        anarchy.put("anarchist", new PackageConfig("anarchist", 
            List.of("essentials.kit.anarchist"), 
            "§cВы получили донат-пакет §4Анархист§c!"));
        anarchy.put("warlord", new PackageConfig("warlord", 
            List.of("essentials.kit.warlord", "essentials.fly"), 
            "§cВы получили донат-пакет §6Военачальник§c!"));
        anarchy.put("chaos", new PackageConfig("chaos", 
            List.of("essentials.kit.chaos", "essentials.fly", "essentials.god"), 
            "§cВы получили донат-пакет §5Хаос§c!"));
        
        packages.put("survival", survival);
        packages.put("anarchy", anarchy);
    }
    
    private void startWebhookServer() throws IOException {
        server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/webhook", new WebhookHandler());
        server.setExecutor(null);
        server.start();
    }
    
    private class WebhookHandler implements HttpHandler {
        private final Gson gson = new Gson();
        
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"POST".equals(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, "{\"error\": \"Method not allowed\"}");
                return;
            }
            
            try {
                // Читаем тело запроса
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                
                JsonObject data = gson.fromJson(body, JsonObject.class);
                
                // Проверяем подпись
                if (!secretKey.isEmpty() && data.has("signature")) {
                    String receivedSignature = data.get("signature").getAsString();
                    data.remove("signature");
                    
                    String calculatedSignature = calculateSignature(gson.toJson(data));
                    if (!receivedSignature.equals(calculatedSignature)) {
                        sendResponse(exchange, 401, "{\"error\": \"Invalid signature\"}");
                        return;
                    }
                }
                
                // Получаем данные
                String player = data.get("player").getAsString();
                String mode = data.get("mode").getAsString();
                String packageName = data.get("package").getAsString();
                
                // Выдаем донат в главном потоке сервера
                Bukkit.getScheduler().runTask(DonateWebhook.this, () -> {
                    giveDonate(player, mode, packageName);
                });
                
                sendResponse(exchange, 200, "{\"success\": true, \"message\": \"Donation processed\"}");
                
            } catch (Exception e) {
                getLogger().log(Level.SEVERE, "Ошибка обработки webhook", e);
                sendResponse(exchange, 500, "{\"error\": \"Internal server error\"}");
            }
        }
        
        private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(statusCode, response.getBytes().length);
            OutputStream os = exchange.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }
    }
    
    private void giveDonate(String playerName, String mode, String packageName) {
        try {
            // Получаем конфигурацию пакета
            PackageConfig config = packages.getOrDefault(mode, new HashMap<>()).get(packageName);
            if (config == null) {
                getLogger().warning("Неизвестный пакет: " + packageName + " для режима " + mode);
                return;
            }
            
            // Получаем пользователя LuckPerms
            User user = luckPerms.getUserManager().loadUser(
                Bukkit.getOfflinePlayer(playerName).getUniqueId()
            ).join();
            
            if (user == null) {
                getLogger().warning("Пользователь не найден: " + playerName);
                return;
            }
            
            // Добавляем группу
            user.data().add(Node.builder("group." + config.getGroup()).build());
            
            // Добавляем права
            for (String permission : config.getPermissions()) {
                user.data().add(Node.builder(permission).build());
            }
            
            // Сохраняем изменения
            luckPerms.getUserManager().saveUser(user);
            
            // Отправляем сообщение игроку
            if (Bukkit.getPlayer(playerName) != null) {
                Bukkit.getPlayer(playerName).sendMessage(config.getMessage());
            }
            
            // Уведомляем администраторов
            String adminMsg = "§7[§6Донат§7] §aИгрок §e" + playerName + 
                            " §aполучил пакет §6" + packageName + 
                            "§a на режиме §b" + mode + "§a!";
            Bukkit.getOnlinePlayers().stream()
                .filter(p -> p.hasPermission("donate.admin"))
                .forEach(p -> p.sendMessage(adminMsg));
            
            getLogger().info("Донат выдан: " + playerName + " -> " + packageName + " (" + mode + ")");
            
        } catch (Exception e) {
            getLogger().log(Level.SEVERE, "Ошибка выдачи доната для " + playerName, e);
        }
    }
    
    private String calculateSignature(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes());
            
            StringBuilder result = new StringBuilder();
            for (byte b : hash) {
                result.append(String.format("%02x", b));
            }
            return result.toString();
        } catch (Exception e) {
            getLogger().log(Level.SEVERE, "Ошибка вычисления подписи", e);
            return "";
        }
    }
    
    private static class PackageConfig {
        private final String group;
        private final List<String> permissions;
        private final String message;
        
        public PackageConfig(String group, List<String> permissions, String message) {
            this.group = group;
            this.permissions = permissions;
            this.message = message;
        }
        
        public String getGroup() { return group; }
        public List<String> getPermissions() { return permissions; }
        public String getMessage() { return message; }
    }
}
