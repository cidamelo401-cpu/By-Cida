import type { PostMural } from '@/types';

export default function MuralPost({ post }: { post: PostMural }) {
  return (
    <li className="flex flex-col gap-2.5 rounded-[20px] border border-forest/[.07] bg-white p-4">
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full font-display text-[13px] font-bold leading-none text-white"
          style={{ background: post.cor }}
        >
          {post.iniciais}
        </span>
        <span className="flex-1 text-[13px] font-bold leading-none text-forest">{post.autora}</span>
        <span className="text-[11px] font-medium leading-none text-forest/40">{post.quando}</span>
      </div>
      <p className="text-[13px] font-medium leading-[1.5] text-forest/75">{post.texto}</p>
      <div className="flex gap-4 text-[11px] font-semibold leading-none text-moss">
        <span>♡ {post.reacoes}</span>
        <span>Responder</span>
      </div>
    </li>
  );
}
