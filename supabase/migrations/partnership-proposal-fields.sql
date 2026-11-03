-- ENAT HSI — campos para propostas de parceria
-- Execute no SQL Editor do mesmo projeto Supabase usado pela Central ENAT HSI.
-- Migração aditiva: não remove nem sobrescreve dados existentes.

alter table public.cmnt_sponsorship_leads
  add column if not exists proposed_amount numeric(12,2),
  add column if not exists proposal_conditions text,
  add column if not exists proposal_valid_until date,
  add column if not exists proposal_subject text,
  add column if not exists proposal_sent_at timestamptz;

comment on column public.cmnt_sponsorship_leads.proposed_amount is 'Valor proposto em reais para a solicitação de parceria';
comment on column public.cmnt_sponsorship_leads.proposal_conditions is 'Escopo, condições e observações da proposta';
comment on column public.cmnt_sponsorship_leads.proposal_valid_until is 'Data de validade da proposta';
comment on column public.cmnt_sponsorship_leads.proposal_subject is 'Assunto do e-mail de proposta';
comment on column public.cmnt_sponsorship_leads.proposal_sent_at is 'Data/hora em que o administrador registrou o envio da proposta';
