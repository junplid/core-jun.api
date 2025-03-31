export type BillingEventsAsaas_T =
  | "PAYMENT_CREATED"
  | "PAYMENT_AWAITING_RISK_ANALYSIS"
  | "PAYMENT_APPROVED_BY_RISK_ANALYSIS"
  | "PAYMENT_REPROVED_BY_RISK_ANALYSIS"
  | "PAYMENT_AUTHORIZED"
  | "PAYMENT_UPDATED"
  | "PAYMENT_CONFIRMED"
  | "PAYMENT_RECEIVED"
  | "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED"
  | "PAYMENT_ANTICIPATED"
  | "PAYMENT_OVERDUE"
  | "PAYMENT_DELETED"
  | "PAYMENT_RESTORED"
  | "PAYMENT_REFUNDED"
  | "PAYMENT_REFUND_IN_PROGRESS"
  | "PAYMENT_RECEIVED_IN_CASH_UNDONE"
  | "PAYMENT_CHARGEBACK_REQUESTED"
  | "PAYMENT_CHARGEBACK_DISPUTE"
  | "PAYMENT_AWAITING_CHARGEBACK_REVERSAL"
  | "PAYMENT_DUNNING_RECEIVED"
  | "PAYMENT_DUNNING_REQUESTED"
  | "PAYMENT_BANK_SLIP_VIEWED"
  | "PAYMENT_CHECKOUT_VIEWED";

export enum BillingEventsAsaas {
  /** Geração de nova cobrança */
  PAYMENT_CREATED = "PAYMENT_CREATED",
  /** Pagamento em cartão aguardando aprovação pela análise manual de risco. */
  PAYMENT_AWAITING_RISK_ANALYSIS = "PAYMENT_AWAITING_RISK_ANALYSIS",
  /** Pagamento em cartão aprovado pela análise manual de risco */
  PAYMENT_APPROVED_BY_RISK_ANALYSIS = "PAYMENT_APPROVED_BY_RISK_ANALYSIS",
  /** Pagamento em cartão reprovado pela análise manual de risco */
  PAYMENT_REPROVED_BY_RISK_ANALYSIS = "PAYMENT_REPROVED_BY_RISK_ANALYSIS",
  /** Pagamento em cartão que foi autorizado e precisa ser capturado */
  PAYMENT_AUTHORIZED = "PAYMENT_AUTHORIZED",
  /** Alteração no vencimento ou valor de cobrança existente */
  PAYMENT_UPDATED = "PAYMENT_UPDATED",
  /** Cobrança confirmada (pagamento efetuado, porém o saldo ainda não foi disponibilizado) */
  PAYMENT_CONFIRMED = "PAYMENT_CONFIRMED",
  /** Cobrança recebida */
  PAYMENT_RECEIVED = "PAYMENT_RECEIVED",
  /** Falha no pagamento de cartão de crédito */
  PAYMENT_CREDIT_CARD_CAPTURE_REFUSED = "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED",
  /** Cobrança antecipada */
  PAYMENT_ANTICIPATED = "PAYMENT_ANTICIPATED",
  /** Cobrança vencida */
  PAYMENT_OVERDUE = "PAYMENT_OVERDUE",
  /** Cobrança removida */
  PAYMENT_DELETED = "PAYMENT_DELETED",
  /** Cobrança restaurada */
  PAYMENT_RESTORED = "PAYMENT_RESTORED",
  /** Cobrança estornada */
  PAYMENT_REFUNDED = "PAYMENT_REFUNDED",
  /** Estorno em processamento (liquidação já está agendada, cobrança será estornada após executar a liquidação). */
  PAYMENT_REFUND_IN_PROGRESS = "PAYMENT_REFUND_IN_PROGRESS",
  /** Recebimento em dinheiro desfeito */
  PAYMENT_RECEIVED_IN_CASH_UNDONE = "PAYMENT_RECEIVED_IN_CASH_UNDONE",
  /** Recebido chargeback */
  PAYMENT_CHARGEBACK_REQUESTED = "PAYMENT_CHARGEBACK_REQUESTED",
  /** Em disputa de chargeback (caso sejam apresentados documentos para contestação). */
  PAYMENT_CHARGEBACK_DISPUTE = "PAYMENT_CHARGEBACK_DISPUTE",
  /** Disputa vencida, aguardando repasse da adquirente */
  PAYMENT_AWAITING_CHARGEBACK_REVERSAL = "PAYMENT_AWAITING_CHARGEBACK_REVERSAL",
  /** Recebimento de negativação */
  PAYMENT_DUNNING_RECEIVED = "PAYMENT_DUNNING_RECEIVED",
  /** Requisição de negativação */
  PAYMENT_DUNNING_REQUESTED = "PAYMENT_DUNNING_REQUESTED",
  /** Boleto da cobrança visualizado pelo cliente */
  PAYMENT_BANK_SLIP_VIEWED = "PAYMENT_BANK_SLIP_VIEWED",
  /** Fatura da cobrança visualizada pelo cliente */
  PAYMENT_CHECKOUT_VIEWED = "PAYMENT_CHECKOUT_VIEWED",
}

export type StatusChargeAsaas_T =
  | "PENDING"
  | "RECEIVED"
  | "CONFIRMED"
  | "OVERDUE"
  | "REFUNDED"
  | "RECEIVED_IN_CASH"
  | "REFUND_REQUESTED"
  | "REFUND_IN_PROGRESS"
  | "CHARGEBACK_REQUESTED"
  | "CHARGEBACK_DISPUTE"
  | "AWAITING_CHARGEBACK_REVERSAL"
  | "DUNNING_REQUESTED"
  | "DUNNING_RECEIVED"
  | "AWAITING_RISK_ANALYSIS";

export type SubscriptionEventsAsaas_T =
  | "SUBSCRIPTION_CREATED"
  | "SUBSCRIPTION_UPDATED"
  | "SUBSCRIPTION_INACTIVATED"
  | "SUBSCRIPTION_DELETED"
  | "SUBSCRIPTION_SPLIT_DIVERGENCE_BLOCK"
  | "SUBSCRIPTION_SPLIT_DIVERGENCE_BLOCK_FINISHED";
