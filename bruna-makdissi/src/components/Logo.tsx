import Image from 'next/image';

type LogoProps = {
  variant?: 'claro' | 'escuro';
  className?: string;
};

/**
 * Lockup oficial (arquivo PNG, nunca desenhado em CSS). Em tamanho de cabeçalho
 * (não "grande"), a skill de marca autoriza usar o PNG completo diretamente —
 * a recomposição a partir do símbolo novo só é exigida para logotipo em destaque.
 */
export function Logo({ variant = 'claro', className }: LogoProps) {
  const src = variant === 'escuro' ? '/brand/lockup-completo-escuro.png' : '/brand/lockup-completo-claro.png';
  return (
    <Image
      src={src}
      alt="Bruna Makdissi — Consciência que transforma"
      width={1419}
      height={357}
      className={className}
      priority
    />
  );
}
