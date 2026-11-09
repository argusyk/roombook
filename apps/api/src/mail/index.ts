// Пошта RoomBook через адаптер Mailer. Транспорт задає MAIL_TRANSPORT:
//   log  – (dev/test) лист пишеться в журнал, нікуди не надсилається;
//   smtp – справжній SMTP за SMTP_URL (лише продакшн; облікові дані – секрет).
// У тестах – InMemoryMailer (mail/memory.ts).
import { config } from "../config";

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
}

export interface Mailer {
  send(message: MailMessage): Promise<void>;
}

export class LogMailer implements Mailer {
  constructor(private readonly log: (line: string) => void = console.log) {}

  async send(m: MailMessage): Promise<void> {
    this.log(`[mail] to=${m.to} subject=${JSON.stringify(m.subject)}\n${m.text}`);
  }
}

export class SmtpMailer implements Mailer {
  constructor(
    private readonly url: string,
    private readonly from: string,
  ) {}

  async send(m: MailMessage): Promise<void> {
    const { createTransport } = await import("nodemailer");
    const transport = createTransport(this.url);
    await transport.sendMail({ from: this.from, to: m.to, subject: m.subject, text: m.text });
  }
}

export function createMailer(): Mailer {
  if (config.MAIL_TRANSPORT === "smtp") {
    if (!config.SMTP_URL) throw new Error("MAIL_TRANSPORT=smtp потребує SMTP_URL");
    return new SmtpMailer(config.SMTP_URL, config.MAIL_FROM);
  }
  return new LogMailer();
}
