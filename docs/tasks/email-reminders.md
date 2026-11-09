Гілка main. Реалізуй нагадування про консультації на email за 1 год до
ConsultationSlot.startsAt. Код у apps/api/src/reminders/.
Вимоги:
- надсилання через інтерфейс Mailer (apps/api/src/mail/); у тестах
  InMemoryMailer; жодних справжніх SMTP-облікових даних;
- кожне нагадування надсилається рівно один раз, навіть якщо запущено
  кілька екземплярів API (див. docs/debugging/ про гонку з розділу 12);
- запуск окремою командою pnpm --filter @roombook/api reminders:run,
  яку в продакшені викликає cron;
- час у базі в UTC, CAMPUS_TZ = Europe/Kyiv; тест на тиждень переходу
  на зимовий час (25.10.2026).
Нових залежностей без потреби не додавай; якщо додаєш, поясни чому.
Готово, коли pnpm -r typecheck і pnpm --filter @roombook/api test
зелені, а в підсумку є перелік нових тестів.
