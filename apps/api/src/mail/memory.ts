import type { Mailer, MailMessage } from "./index";

/** Пошта в пам'яті для тестів: листи лише накопичуються в масиві. */
export class InMemoryMailer implements Mailer {
  readonly sent: MailMessage[] = [];

  async send(message: MailMessage): Promise<void> {
    this.sent.push(message);
  }
}
