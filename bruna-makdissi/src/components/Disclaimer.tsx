/**
 * Texto composto a partir dos disclaimers já aprovados por produto em
 * services.ts (cuidadosLinguagem), generalizado para rodapé. PROVISÓRIO —
 * ainda não passou pela validação específica da Bruna neste texto combinado
 * (claims-e-safety.md: "marque como provisório todo texto que ainda não
 * passou pela Bruna").
 */
export function Disclaimer() {
  return (
    <p className="font-body text-xs font-light leading-relaxed text-tinta-500">
      Os atendimentos, mentorias e jornadas da Bruna Makdissi são um trabalho energético, simbólico e de
      desenvolvimento pessoal. Eles complementam, mas não substituem acompanhamento médico, nutricional,
      psicológico ou veterinário profissional.
    </p>
  );
}
