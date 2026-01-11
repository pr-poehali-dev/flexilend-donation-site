import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted">
      <nav className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded pixelated flex items-center justify-center">
              <span className="text-2xl">🧊</span>
            </div>
            <h1 className="text-2xl font-bold text-primary">FlexiLend</h1>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'home' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('home')}
              className="minecraft-shadow"
            >
              <Icon name="Home" size={20} className="mr-2" />
              Главная
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/donate')}
              className="hover:bg-primary/20"
            >
              <Icon name="Gift" size={20} className="mr-2" />
              Донат
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/history')}
              className="hover:bg-primary/20"
            >
              <Icon name="User" size={20} className="mr-2" />
              Личный кабинет
            </Button>
          </div>
        </div>
      </nav>

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-6xl md:text-7xl font-bold mb-6 text-primary drop-shadow-2xl">
              FlexiLend
            </h2>
            <p className="text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Майнкрафт сервер нового поколения
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 minecraft-shadow hover:scale-105 transition-transform"
                onClick={() => navigate('/donate')}
              >
                <Icon name="Sparkles" size={24} className="mr-2" />
                Купить донат
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 minecraft-border hover:scale-105 transition-transform"
              >
                <Icon name="Copy" size={24} className="mr-2" />
                Скопировать IP
              </Button>
            </div>
          </div>

          <Card className="max-w-4xl mx-auto minecraft-border bg-card/90 backdrop-blur-sm animate-scale-in mb-12">
            <div className="p-8">
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="description">
                    <Icon name="FileText" size={18} className="mr-2" />
                    Описание
                  </TabsTrigger>
                  <TabsTrigger value="features">
                    <Icon name="Star" size={18} className="mr-2" />
                    Особенности
                  </TabsTrigger>
                  <TabsTrigger value="info">
                    <Icon name="Info" size={18} className="mr-2" />
                    Информация
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="space-y-4">
                  <div className="prose prose-invert max-w-none">
                    <h3 className="text-2xl font-bold mb-4">О сервере</h3>
                    <div className="text-muted-foreground space-y-4 text-lg leading-relaxed">
                      <p>
                        <strong className="text-foreground">FlexiLend</strong> — это уникальный Minecraft сервер, 
                        где каждый найдет что-то для себя. Мы предлагаем разнообразные режимы игры, 
                        продуманную экономику и дружелюбное комьюнити.
                      </p>
                      <p>
                        Здесь вы можете описать историю сервера, его миссию и ценности. 
                        Расскажите игрокам, чем ваш сервер отличается от других и почему стоит 
                        присоединиться именно к вам.
                      </p>
                      <p className="text-primary font-semibold">
                        Это место, где вы можете добавить своё описание сервера!
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="features" className="space-y-4">
                  <h3 className="text-2xl font-bold mb-6">Что мы предлагаем</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { icon: 'TreePine', title: 'Выживание', desc: 'Классический режим с улучшениями' },
                      { icon: 'Flame', title: 'Анархия', desc: 'Полная свобода действий' },
                      { icon: 'Cloud', title: 'Скайблок', desc: 'Выживание в небесах' },
                      { icon: 'Shield', title: 'Защита', desc: 'Надежная защита территорий' },
                      { icon: 'Users', title: 'Комьюнити', desc: 'Активное и дружелюбное' },
                      { icon: 'Zap', title: 'Без лагов', desc: 'Мощные серверы' }
                    ].map((feature, i) => (
                      <div 
                        key={i}
                        className="p-4 bg-muted/50 rounded-lg flex items-start gap-3 hover:bg-muted transition-colors"
                      >
                        <div className="p-2 bg-primary/20 rounded">
                          <Icon name={feature.icon as any} size={24} className="text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold mb-1">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground">{feature.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="info" className="space-y-6">
                  <h3 className="text-2xl font-bold mb-6">Информация о сервере</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">IP адрес:</span>
                        <code className="bg-background px-3 py-1 rounded text-primary">
                          play.flexilend.ru
                        </code>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Версия:</span>
                        <span className="text-muted-foreground">1.20.x</span>
                      </div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Онлайн:</span>
                        <span className="text-primary font-bold">42 / 100</span>
                      </div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Режим:</span>
                        <span className="text-muted-foreground">Survival, Anarchy, SkyBlock</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-primary/10 border border-primary/30 rounded-lg">
                    <h4 className="font-bold text-lg mb-3 flex items-center">
                      <Icon name="MessageCircle" size={20} className="mr-2 text-primary" />
                      Наши социальные сети
                    </h4>
                    <div className="flex gap-3 flex-wrap">
                      <Button variant="outline" size="sm">
                        <Icon name="MessageCircle" size={16} className="mr-2" />
                        Discord
                      </Button>
                      <Button variant="outline" size="sm">
                        <Icon name="Send" size={16} className="mr-2" />
                        Telegram
                      </Button>
                      <Button variant="outline" size="sm">
                        <Icon name="Youtube" size={16} className="mr-2" />
                        YouTube
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto animate-fade-in">
            {[
              {
                icon: 'Users',
                title: 'Активное комьюнити',
                desc: 'Более 1000 активных игроков',
                color: 'from-blue-600 to-blue-800'
              },
              {
                icon: 'Shield',
                title: 'Честная игра',
                desc: 'Строгая античит система',
                color: 'from-green-600 to-green-800'
              },
              {
                icon: 'Award',
                title: 'Регулярные ивенты',
                desc: 'Еженедельные турниры',
                color: 'from-purple-600 to-purple-800'
              }
            ].map((item, index) => (
              <Card
                key={index}
                className="minecraft-border text-center p-6 bg-card/90 backdrop-blur-sm hover:scale-105 transition-transform animate-scale-in"
                style={{ animationDelay: `${(index + 3) * 100}ms` }}
              >
                <div className="mb-4 flex justify-center">
                  <div className={`p-4 rounded-lg bg-gradient-to-br ${item.color}`}>
                    <Icon name={item.icon as any} size={32} className="text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <span className="text-2xl">🧊</span>
            <span>© 2026 FlexiLend. Все права защищены.</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
