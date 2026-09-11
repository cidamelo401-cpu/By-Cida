"use client";

import { useState, type FormEvent } from "react";

const CONTACT_EMAIL = "contato@bycida.com.br";

const CONTACT_INFO = [
  { label: "E-mail", value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  { label: "Telefone", value: "(00) 00000-0000", href: "tel:+5500000000000" },
  { label: "Endereço", value: "Sua cidade, Estado", href: undefined },
];

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const message = String(formData.get("message") ?? "");

    const subject = encodeURIComponent(`Contato pelo site — ${name}`);
    const body = encodeURIComponent(`${message}\n\nResponder para: ${email}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setStatus("sent");
  }

  return (
    <section id="contato" className="scroll-mt-20 px-6 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <div>
            <span className="text-sm font-medium uppercase tracking-wide text-accent">
              Contato
            </span>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Vamos conversar
            </h2>
            <p className="mt-4 text-muted-foreground">
              Preencha o formulário ou entre em contato diretamente por um dos canais abaixo.
            </p>
          </div>

          <dl className="flex flex-col gap-4">
            {CONTACT_INFO.map((item) => (
              <div key={item.label} className="flex flex-col">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </dt>
                <dd className="mt-1">
                  {item.href ? (
                    <a href={item.href} className="font-medium text-accent hover:underline">
                      {item.value}
                    </a>
                  ) : (
                    <span className="font-medium">{item.value}</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Nome
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
              placeholder="Seu nome"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
              placeholder="seu@email.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="message" className="text-sm font-medium">
              Mensagem
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              className="resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
              placeholder="Como podemos ajudar?"
            />
          </div>

          <button
            type="submit"
            className="mt-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            Enviar mensagem
          </button>

          {status === "sent" && (
            <p className="text-sm text-muted-foreground">
              Abrimos seu app de e-mail com a mensagem pronta para envio.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
