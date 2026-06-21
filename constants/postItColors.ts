export const POST_IT_COLORS = [
    "#FFD966", // amarelo
    "#FF9966", // laranja
    "#FF6B6B", // vermelho rosado
    "#F78FB3", // rosa
    "#C39BD3", // lilás
    "#7FB3D3", // azul claro
    "#76D7C4", // verde água
    "#82E0AA", // verde claro
    "#F7DC6F", // amarelo esverdeado
    "#F0B27A", // pêssego
] as const;

export type PostItColor = (typeof POST_IT_COLORS)[number];
