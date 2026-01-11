import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import MinecraftBackground from '@/components/MinecraftBackground';

interface Transaction {
  id: string;
  date: string;
  package: string;
  mode: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
}

interface ActiveDonate {
  id: string;
  package: string;
  mode: string;
  activatedAt: string;
  expiresAt: string;
  features: string[];
}

const History = () => {
  const navigate = useNavigate();

  const [transactions] = useState<Transaction[]>([
    {
      id: 'TXN001',
      date: '2026-01-10',
      package: 'Премиум',
      mode: 'Выживание',
      amount: 299,
      status: 'completed'
    },
    {
      id: 'TXN002',
      date: '2026-01-08',
      package: 'Базовый',
      mode: 'Анархия',
      amount: 99,
      status: 'completed'
    }
  ]);

  const [activeDonates] = useState<ActiveDonate[]>([
    {
      id: 'DON001',
      package: 'Премиум',
      mode: 'Выживание',
      activatedAt: '2026-01-10',
      expiresAt: '2026-02-10',
      features: ['Префикс в чате', 'Доступ к /fly', '15 домов', 'Приоритет входа']
    }
  ]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; text: string }> = {
      completed: { color: 'bg-green-600', text: 'Завершено' },
      pending: { color: 'bg-yellow-600', text: 'В обработке' },
      failed: { color: 'bg-red-600', text: 'Ошибка' }
    };
    const variant = variants[status] || variants.completed;
    return <Badge className={variant.color}>{variant.text}</Badge>;
  };

  const getDaysLeft = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 relative">
      <MinecraftBackground />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 hover:bg-primary/20"
          onClick={() => navigate('/')}
        >
          <Icon name="ArrowLeft" size={20} className="mr-2" />
          Назад на главную
        </Button>

        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 text-primary drop-shadow-lg">
            Личный кабинет
          </h1>
          <p className="text-xl text-muted-foreground">
            История покупок и активные донаты
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="active" className="text-lg">
                <Icon name="Zap" size={20} className="mr-2" />
                Активные донаты
              </TabsTrigger>
              <TabsTrigger value="history" className="text-lg">
                <Icon name="History" size={20} className="mr-2" />
                История транзакций
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6">
              {activeDonates.length === 0 ? (
                <Card className="p-12 text-center minecraft-border bg-card/90">
                  <Icon name="PackageOpen" size={64} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-2xl font-bold mb-2">Нет активных донатов</h3>
                  <p className="text-muted-foreground mb-6">
                    Приобретите донат-пакет чтобы получить преимущества
                  </p>
                  <Button onClick={() => navigate('/donate')}>
                    <Icon name="ShoppingBag" size={20} className="mr-2" />
                    Перейти к донатам
                  </Button>
                </Card>
              ) : (
                activeDonates.map((donate, index) => (
                  <Card
                    key={donate.id}
                    className="minecraft-border overflow-hidden bg-card/90 backdrop-blur-sm animate-scale-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="h-2 bg-gradient-to-r from-primary to-accent" />
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">{donate.package}</h3>
                          <p className="text-muted-foreground flex items-center">
                            <Icon name="Gamepad2" size={16} className="mr-2" />
                            {donate.mode}
                          </p>
                        </div>
                        <div className="mt-4 md:mt-0 text-right">
                          <Badge className="bg-primary text-lg px-4 py-2">
                            {getDaysLeft(donate.expiresAt)} дней осталось
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-2">
                            До {new Date(donate.expiresAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {donate.features.map((feature, i) => (
                          <div key={i} className="flex items-start p-3 bg-muted/50 rounded">
                            <Icon name="Check" size={20} className="text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 flex gap-3">
                        <Button variant="outline" className="flex-1">
                          <Icon name="RefreshCw" size={16} className="mr-2" />
                          Продлить
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Icon name="Gift" size={16} className="mr-2" />
                          Улучшить
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {transactions.length === 0 ? (
                <Card className="p-12 text-center minecraft-border bg-card/90">
                  <Icon name="FileText" size={64} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-2xl font-bold mb-2">История пуста</h3>
                  <p className="text-muted-foreground">
                    Здесь будут отображаться ваши покупки
                  </p>
                </Card>
              ) : (
                transactions.map((transaction, index) => (
                  <Card
                    key={transaction.id}
                    className="p-6 minecraft-border bg-card/90 backdrop-blur-sm hover:scale-[1.02] transition-transform animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/20 rounded-lg">
                          <Icon name="Receipt" size={24} className="text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg mb-1">{transaction.package}</h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Icon name="Gamepad2" size={14} />
                            {transaction.mode}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            ID: {transaction.id}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end gap-2">
                        {getStatusBadge(transaction.status)}
                        <p className="text-2xl font-bold text-primary">{transaction.amount}₽</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default History;