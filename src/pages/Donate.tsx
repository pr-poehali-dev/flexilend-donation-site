import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const Donate = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const modes = [
    {
      id: 'survival',
      name: 'Выживание',
      icon: 'TreePine',
      description: 'Классический режим выживания с улучшениями',
      color: 'from-green-600 to-green-800'
    },
    {
      id: 'anarchy',
      name: 'Анархия',
      icon: 'Flame',
      description: 'Без правил и ограничений',
      color: 'from-red-600 to-red-800'
    },
    {
      id: 'skyblock',
      name: 'Скайблок',
      icon: 'Cloud',
      description: 'Выживание в небесах',
      color: 'from-blue-600 to-blue-800'
    }
  ];

  const handleModeSelect = (modeId: string) => {
    setSelectedMode(modeId);
    navigate(`/donate/${modeId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
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
            Выберите режим игры
          </h1>
          <p className="text-xl text-muted-foreground">
            Подберите донат для вашего любимого режима
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {modes.map((mode, index) => (
            <Card
              key={mode.id}
              className="minecraft-border overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-scale-in bg-card/90 backdrop-blur-sm"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleModeSelect(mode.id)}
            >
              <div className={`h-2 bg-gradient-to-r ${mode.color}`} />
              <div className="p-8 text-center">
                <div className="mb-6 flex justify-center">
                  <div className={`p-4 rounded-lg bg-gradient-to-br ${mode.color}`}>
                    <Icon name={mode.icon as any} size={48} className="text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">{mode.name}</h3>
                <p className="text-muted-foreground mb-6">{mode.description}</p>
                <Button className="w-full minecraft-shadow bg-primary hover:bg-primary/90">
                  Выбрать режим
                  <Icon name="ChevronRight" size={20} className="ml-2" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Donate;
