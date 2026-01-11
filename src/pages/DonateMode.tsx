import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import MinecraftBackground from '@/components/MinecraftBackground';

interface DonatePackage {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
}

const DonateMode = () => {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [nickname, setNickname] = useState('');
  const [promo, setPromo] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const modeNames: Record<string, string> = {
    survival: 'Выживание',
    anarchy: 'Анархия',
    skyblock: 'Скайблок'
  };

  const packages: DonatePackage[] = [
    {
      id: 'basic',
      name: 'Базовый',
      price: 99,
      features: ['Префикс в чате', 'Доступ к /fly', '5 домов']
    },
    {
      id: 'premium',
      name: 'Премиум',
      price: 299,
      features: ['Все из Базового', 'Уникальные кейсы', '15 домов', 'Приоритет входа'],
      popular: true
    },
    {
      id: 'vip',
      name: 'VIP',
      price: 599,
      features: ['Все из Премиум', 'Цветной ник', 'Неограниченно домов', 'Доступ к эксклюзивным зонам']
    }
  ];

  const handlePurchase = async () => {
    if (!nickname) {
      toast({
        title: 'Ошибка',
        description: 'Введите ваш игровой никнейм',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedPackage) {
      toast({
        title: 'Ошибка',
        description: 'Выберите донат-пакет',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    const pkg = packages.find(p => p.id === selectedPackage);

    try {
      const response = await fetch('https://functions.poehali.dev/8569c347-d4d6-41b0-995b-9f9a0075e605', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_payment',
          nickname: nickname,
          package_id: selectedPackage,
          mode: mode || 'survival',
          amount: pkg?.price || 0,
          promo: promo
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.discount > 0) {
          toast({
            title: 'Промокод применён!',
            description: `Скидка ${data.discount}₽. Итого: ${data.final_amount}₽`,
          });
        }
        
        toast({
          title: 'Переход к оплате',
          description: `Заказ #${data.order_id.slice(0, 8)}`,
        });
        
        setTimeout(() => {
          window.open(data.payment_url, '_blank');
        }, 1000);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать платёж',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось связаться с сервером',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 relative">
      <MinecraftBackground />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 hover:bg-primary/20"
          onClick={() => navigate('/donate')}
        >
          <Icon name="ArrowLeft" size={20} className="mr-2" />
          Назад к режимам
        </Button>

        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 text-primary drop-shadow-lg">
            {modeNames[mode || ''] || 'Донаты'}
          </h1>
          <p className="text-xl text-muted-foreground">
            Выберите подходящий донат-пакет
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-12">
          {packages.map((pkg, index) => (
            <Card
              key={pkg.id}
              className={`minecraft-border overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 animate-scale-in ${
                selectedPackage === pkg.id ? 'ring-2 ring-primary' : ''
              } ${pkg.popular ? 'bg-primary/10' : 'bg-card/90'} backdrop-blur-sm`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              {pkg.popular && (
                <div className="bg-primary text-primary-foreground text-center py-2 font-bold">
                  <Icon name="Star" size={16} className="inline mr-2" />
                  ПОПУЛЯРНЫЙ
                </div>
              )}
              <div className="p-8">
                <h3 className="text-3xl font-bold mb-2">{pkg.name}</h3>
                <div className="text-4xl font-bold text-primary mb-6">
                  {pkg.price}₽
                </div>
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Icon name="Check" size={20} className="text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full minecraft-shadow"
                  variant={selectedPackage === pkg.id ? 'default' : 'outline'}
                >
                  {selectedPackage === pkg.id ? 'Выбрано' : 'Выбрать'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Card className="max-w-2xl mx-auto p-8 minecraft-border bg-card/90 backdrop-blur-sm animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Icon name="ShoppingCart" size={24} className="mr-3 text-primary" />
            Оформление покупки
          </h2>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="nickname" className="text-lg mb-2 block">
                Игровой никнейм *
              </Label>
              <Input
                id="nickname"
                placeholder="Введите ваш ник в Minecraft"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="minecraft-border text-lg"
              />
            </div>

            <div>
              <Label htmlFor="promo" className="text-lg mb-2 block">
                Промокод (необязательно)
              </Label>
              <Input
                id="promo"
                placeholder="Введите промокод если есть"
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                className="minecraft-border text-lg"
              />
            </div>

            {selectedPackage && (
              <div className="p-4 bg-primary/20 rounded-lg border border-primary/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Выбранный пакет:</span>
                  <Badge className="bg-primary">{packages.find(p => p.id === selectedPackage)?.name}</Badge>
                </div>
                <div className="flex justify-between items-center text-2xl font-bold">
                  <span>Итого:</span>
                  <span className="text-primary">{packages.find(p => p.id === selectedPackage)?.price}₽</span>
                </div>
              </div>
            )}

            <Button 
              className="w-full text-lg py-6 minecraft-shadow"
              size="lg"
              onClick={handlePurchase}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Icon name="Loader2" size={24} className="mr-2 animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  <Icon name="CreditCard" size={24} className="mr-2" />
                  Перейти к оплате
                </>
              )}
            </Button>
            
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                <Icon name="Lock" size={14} className="inline mr-1" />
                Безопасная оплата через защищённое соединение
              </p>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Доступные промокоды: <strong>FIRST10</strong> (10% скидка), <strong>SALE20</strong> (20% скидка)
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DonateMode;