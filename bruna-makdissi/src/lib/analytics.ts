/**
 * Stub de analytics — só loga no console por enquanto. Trocar por um provedor
 * real (GA4, Meta Pixel etc.) quando a Bruna definir qual usar; a assinatura
 * da função (`track`) não deve mudar, só o corpo.
 */

export type AnalyticsEvent =
  | 'landing_view'
  | 'quiz_started'
  | 'question_answered'
  | 'lead_started'
  | 'lead_submitted'
  | 'result_viewed'
  | 'whatsapp_clicked'
  | 'quiz_abandoned';

export function track(event: AnalyticsEvent, payload?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  // eslint-disable-next-line no-console
  console.info('[analytics]', event, payload ?? {});
}
