import { Product, NavItem, Article } from './types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'FUTEBOL', href: '#' },
  { label: 'SOCIETY', href: '#' },
  { label: 'FUTSAL', href: '#' },
  { label: 'PROMOÇÕES', href: '#' },
];

const BUCKET_URL = "https://olqbvraizyneplodvncb.supabase.co/storage/v1/object/public/Imagens%20do%20site";

export const PRODUCTS: Product[] = [];

export const ARTICLES: Article[] = [
  {
    id: 1,
    title: "FG, AG OU SG: QUAL A TRAVA IDEAL?",
    image: `${BUCKET_URL}/article-travas.png`,
    linkText: "GUIA TÉCNICO"
  },
  {
    id: 2,
    title: "COURO OU SINTÉTICO: O QUE ESCOLHER?",
    image: `${BUCKET_URL}/article-couro.png`,
    linkText: "COMPARATIVO"
  },
  {
    id: 3,
    title: "AS CHUTEIRAS DOS ARTILHEIROS DE 2025",
    image: `${BUCKET_URL}/article-artilheiros.png`,
    linkText: "LER MATÉRIA"
  },
  {
    id: 4,
    title: "COMO CUIDAR DA SUA CHUTEIRA PROFISSIONAL",
    image: `${BUCKET_URL}/article-manutencao.png`,
    linkText: "DICAS DE MANUTENÇÃO"
  }
];