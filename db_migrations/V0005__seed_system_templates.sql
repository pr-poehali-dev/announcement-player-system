INSERT INTO t_p10033396_announcement_player_.announcement_templates 
  (name, category, text_template, variables, voice, zone, is_system)
VALUES
  (
    'Отправление поезда',
    'standard',
    'Внимание! Поезд номер {train_number}, следующий {direction}, отправляется с {platform} платформы в {departure_time}. Нумерация вагонов {wagons}.',
    '[{"key":"train_number","label":"Номер поезда","type":"text"},{"key":"direction","label":"Направление","type":"text"},{"key":"platform","label":"Платформа","type":"text"},{"key":"departure_time","label":"Время отправления","type":"time"},{"key":"wagons","label":"Нумерация вагонов","type":"text"}]',
    'Алина', 'Все зоны', TRUE
  ),
  (
    'Прибытие поезда',
    'standard',
    'Внимание! На {platform} платформу прибывает поезд номер {train_number}, следующий {direction}. Время прибытия {arrival_time}. Нумерация вагонов {wagons}.',
    '[{"key":"train_number","label":"Номер поезда","type":"text"},{"key":"direction","label":"Направление","type":"text"},{"key":"platform","label":"Платформа","type":"text"},{"key":"arrival_time","label":"Время прибытия","type":"time"},{"key":"wagons","label":"Нумерация вагонов","type":"text"}]',
    'Алина', 'Все зоны', TRUE
  ),
  (
    'Задержка поезда',
    'urgent',
    'Внимание! Поезд номер {train_number}, следующий {direction}, задерживается на {delay} минут. Приносим свои извинения.',
    '[{"key":"train_number","label":"Номер поезда","type":"text"},{"key":"direction","label":"Направление","type":"text"},{"key":"delay","label":"Задержка (мин)","type":"number"}]',
    'Алина', 'Все зоны', TRUE
  ),
  (
    'Посадка на поезд',
    'standard',
    'Производится посадка на поезд номер {train_number}, следующий {direction}. Отправление в {departure_time} с {platform} платформы. Просьба занять места согласно билетам.',
    '[{"key":"train_number","label":"Номер поезда","type":"text"},{"key":"direction","label":"Направление","type":"text"},{"key":"departure_time","label":"Время отправления","type":"time"},{"key":"platform","label":"Платформа","type":"text"}]',
    'Алина', 'Все зоны', TRUE
  ),
  (
    'Отмена рейса',
    'urgent',
    'Внимание! Поезд номер {train_number}, следующий {direction}, отменяется. Просьба обратиться в кассу для возврата билетов.',
    '[{"key":"train_number","label":"Номер поезда","type":"text"},{"key":"direction","label":"Направление","type":"text"}]',
    'Алина', 'Все зоны', TRUE
  );
