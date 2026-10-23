// Exames de consciência escritos para o Lumen, a partir do Catecismo da Igreja
// Católica (CIC 1846-1876 sobre o pecado; 2052-2557 sobre os mandamentos;
// 2041-2043 sobre os preceitos da Igreja).
//
// Cada pergunta pode ter `para`: lista de estados de vida em que ela aparece.
// Sem `para`, aparece para todos.

export const ESTADOS = [
  { id: 'solteiro', label: 'Solteiro(a)' },
  { id: 'namoro', label: 'Namorando' },
  { id: 'casado', label: 'Casado(a)' },
  { id: 'pais', label: 'Pai / mãe' },
  { id: 'trabalho', label: 'Trabalho' },
  { id: 'estudo', label: 'Estudo' },
];

export const EXAMES = [
  {
    id: 'mandamentos',
    titulo: 'Os Dez Mandamentos',
    sub: 'O exame completo, mandamento por mandamento',
    tempo: '15 min',
    filtra: true,
    secoes: [
      {
        titulo: '1º · Amar a Deus sobre todas as coisas',
        nota: 'Deus em primeiro lugar.',
        q: [
          { t: 'Deixei de rezar por longos períodos, ou rezei só por costume, sem atenção?' },
          { t: 'Duvidei voluntariamente de alguma verdade da fé, ou neguei a fé diante dos outros?' },
          { t: 'Pratiquei ou consultei superstição, horóscopo, tarô, espiritismo, simpatias ou “energias”?' },
          { t: 'Pus outra coisa no lugar de Deus: dinheiro, sucesso, prazer, aparência, celular, uma pessoa?' },
          { t: 'Recebi a Comunhão em pecado grave, sem antes me confessar?' },
          { t: 'Escondi conscientemente um pecado grave numa confissão anterior?' },
          { t: 'Desesperei da misericórdia de Deus, ou abusei dela pecando porque “depois eu confesso”?' },
          { t: 'Tive vergonha de me mostrar católico por respeito humano?' },
        ],
      },
      {
        titulo: '2º · Não tomar seu santo nome em vão',
        nota: 'O respeito ao que é sagrado.',
        q: [
          { t: 'Usei o nome de Deus, de Jesus, de Nossa Senhora ou dos santos sem respeito, por brincadeira ou com raiva?' },
          { t: 'Blasfemei, ou falei com desprezo de Deus, da Igreja ou das coisas sagradas?' },
          { t: 'Jurei em falso, ou jurei sem necessidade?' },
          { t: 'Fiz uma promessa a Deus e não cumpri?' },
          { t: 'Ri ou compartilhei piadas, memes ou vídeos que zombam da fé?' },
        ],
      },
      {
        titulo: '3º · Guardar domingos e festas',
        nota: 'O dia do Senhor.',
        q: [
          { t: 'Faltei à Missa no domingo ou num dia santo de guarda por culpa minha?' },
          { t: 'Cheguei atrasado por descuido, ou saí antes do fim sem motivo?' },
          { t: 'Fiquei distraído de propósito na Missa: celular, conversa, pensamentos que eu podia afastar?' },
          { t: 'Trabalhei ou fiz trabalhar sem necessidade no domingo, tirando o descanso devido a Deus e à família?' },
          { t: 'Deixei de guardar o jejum eucarístico (uma hora antes de comungar)?' },
          { t: 'Deixei de cumprir o jejum e a abstinência da Quarta-feira de Cinzas e da Sexta-feira Santa, ou a penitência das sextas-feiras?' },
        ],
      },
      {
        titulo: '4º · Honrar pai e mãe',
        nota: 'A família e quem tem autoridade.',
        q: [
          { t: 'Desobedeci ou desrespeitei meus pais, ou os tratei com frieza e impaciência?', para: ['solteiro', 'namoro', 'estudo'] },
          { t: 'Deixei de ajudar meus pais em suas necessidades, na velhice ou na doença?' },
          { t: 'Causei brigas em casa, ou guardei rancor de alguém da família?' },
          { t: 'Descuidei da formação na fé dos meus filhos: oração, Missa, catequese, exemplo?', para: ['pais'] },
          { t: 'Fui duro, injusto ou ausente com meus filhos? Deixei de corrigi-los quando devia?', para: ['pais'] },
          { t: 'Deixei meus filhos expostos, sem cuidado, a conteúdos e companhias que os prejudicam?', para: ['pais'] },
          { t: 'Desrespeitei professores, chefes ou autoridades legítimas?', para: ['estudo', 'trabalho'] },
        ],
      },
      {
        titulo: '5º · Não matar',
        nota: 'A vida, o corpo e a paz.',
        q: [
          { t: 'Desejei mal a alguém, ou guardei ódio e rancor sem querer perdoar?' },
          { t: 'Agredi alguém com palavras, gestos ou violência?' },
          { t: 'Fui cúmplice, aconselhei ou ajudei de algum modo um aborto?' },
          { t: 'Coloquei a vida em risco: dirigindo sob efeito de álcool, com imprudência ou em alta velocidade?' },
          { t: 'Usei drogas, ou me embriaguei?' },
          { t: 'Descuidei gravemente da minha saúde, ou pensei em tirar a minha vida sem procurar ajuda?' },
          { t: 'Levei outra pessoa a pecar pelo meu mau exemplo (escândalo)?' },
          { t: 'Humilhei, zombei ou excluí alguém, pessoalmente ou na internet?' },
        ],
      },
      {
        titulo: '6º e 9º · Castidade',
        nota: 'O corpo, os olhos e o coração.',
        q: [
          { t: 'Consenti em pensamentos ou desejos impuros de propósito?' },
          { t: 'Vi pornografia ou conteúdos sensuais (filmes, séries, redes sociais)?' },
          { t: 'Pratiquei a masturbação?' },
          { t: 'Tive relações sexuais fora do matrimônio?', para: ['solteiro', 'namoro'] },
          { t: 'No namoro, tive intimidades que pertencem só ao matrimônio, ou me coloquei em ocasiões de pecado?', para: ['namoro'] },
          { t: 'Fui infiel ao meu cônjuge, em atos, em pensamentos alimentados ou em conversas?', para: ['casado'] },
          { t: 'Usei métodos contraceptivos, ou fechei o ato conjugal à vida?', para: ['casado'] },
          { t: 'Neguei ao meu cônjuge, sem motivo justo, o que é devido no matrimônio?', para: ['casado'] },
          { t: 'Me vesti ou me mostrei nas redes buscando provocar desejo nos outros?' },
          { t: 'Falei ou ri de conversas e piadas obscenas?' },
        ],
      },
      {
        titulo: '7º e 10º · Não roubar, não cobiçar',
        nota: 'Os bens, a justiça e o desapego.',
        q: [
          { t: 'Roubei, ou fiquei com algo que não era meu? Já devolvi ou reparei?' },
          { t: 'Usei pirataria, ou paguei menos do que devia, enganando alguém?' },
          { t: 'Danifiquei o que é dos outros ou o que é público e não reparei?' },
          { t: 'Fiz o meu trabalho mal feito, perdi tempo de propósito no expediente, ou fraudei horas?', para: ['trabalho'] },
          { t: 'Paguei mal, explorei ou tratei com injustiça quem trabalha para mim?', para: ['trabalho'] },
          { t: 'Colei em provas ou apresentei como meu um trabalho que não fiz?', para: ['estudo'] },
          { t: 'Desperdicei dinheiro em luxo, vício ou jogos de aposta, faltando com a família ou com os pobres?' },
          { t: 'Deixei de ajudar quem precisava, podendo ajudar?' },
          { t: 'Tive inveja dos bens, da vida ou do sucesso dos outros?' },
        ],
      },
      {
        titulo: '8º · Não levantar falso testemunho',
        nota: 'A verdade e a boa fama do próximo.',
        q: [
          { t: 'Menti? Para me livrar, para parecer melhor, para enganar?' },
          { t: 'Caluniei alguém, dizendo dele algo falso?' },
          { t: 'Falei mal dos outros, revelando defeitos e pecados sem necessidade (maledicência)?' },
          { t: 'Julguei mal alguém sem motivo suficiente (juízo temerário)?' },
          { t: 'Compartilhei boatos ou notícias que eu não sabia se eram verdadeiras?' },
          { t: 'Revelei um segredo que me foi confiado?' },
          { t: 'Fui hipócrita, ou bajulei alguém para ganhar algo?' },
        ],
      },
      {
        titulo: 'Preceitos da Igreja',
        nota: 'O mínimo que a Igreja pede de cada fiel.',
        q: [
          { t: 'Deixei de me confessar ao menos uma vez por ano?' },
          { t: 'Deixei de comungar ao menos pela Páscoa?' },
          { t: 'Deixei de ajudar a Igreja nas suas necessidades, segundo as minhas possibilidades?' },
        ],
      },
    ],
  },

  {
    id: 'capitais',
    titulo: 'Pecados capitais',
    sub: 'Pelas raízes: os sete vícios e as virtudes opostas',
    tempo: '10 min',
    filtra: false,
    secoes: [
      {
        titulo: 'Soberba · contra a humildade',
        nota: 'A raiz de todos.',
        q: [
          { t: 'Me achei melhor que os outros, ou desprezei alguém?' },
          { t: 'Busquei elogios e atenção, ou fiquei ressentido quando não me notaram?' },
          { t: 'Não aceitei correção, ou não reconheci que errei?' },
          { t: 'Fiz o bem para ser visto?' },
        ],
      },
      {
        titulo: 'Avareza · contra a generosidade',
        q: [
          { t: 'Fui apegado ao dinheiro e às coisas, a ponto de me fechar para os outros?' },
          { t: 'Neguei esmola ou ajuda podendo dar?' },
          { t: 'Fui desonesto para ganhar mais?' },
        ],
      },
      {
        titulo: 'Luxúria · contra a castidade',
        q: [
          { t: 'Alimentei pensamentos, olhares ou desejos impuros?' },
          { t: 'Vi conteúdo impuro, ou pratiquei atos contra a castidade?' },
          { t: 'Busquei situações que sei que me levam a cair?' },
        ],
      },
      {
        titulo: 'Ira · contra a mansidão',
        q: [
          { t: 'Me deixei levar pela raiva, gritei, xinguei, humilhei?' },
          { t: 'Guardei rancor, ou me recusei a perdoar?' },
          { t: 'Desejei vingança?' },
        ],
      },
      {
        titulo: 'Gula · contra a temperança',
        q: [
          { t: 'Comi ou bebi em excesso, por prazer desordenado?' },
          { t: 'Me embriaguei?' },
          { t: 'Não fiz nenhuma mortificação, nem nos dias de penitência?' },
        ],
      },
      {
        titulo: 'Inveja · contra a caridade',
        q: [
          { t: 'Fiquei triste com o bem dos outros, ou feliz com o mal deles?' },
          { t: 'Diminuí os outros para me sentir maior?' },
        ],
      },
      {
        titulo: 'Preguiça e acídia · contra a diligência',
        nota: 'Inclui a tristeza diante das coisas de Deus.',
        q: [
          { t: 'Deixei de cumprir meus deveres de estado, de trabalho ou de estudo?' },
          { t: 'Perdi tempo demais com o celular, séries ou jogos, fugindo do que devia fazer?' },
          { t: 'Deixei a oração e as coisas de Deus por tédio ou desânimo?' },
          { t: 'Adiei a conversão: “depois eu mudo”?' },
        ],
      },
    ],
  },

  {
    id: 'breve',
    titulo: 'Exame breve',
    sub: 'Para quando o tempo é curto ou para a fila da confissão',
    tempo: '5 min',
    filtra: false,
    secoes: [
      {
        titulo: 'Com Deus',
        q: [
          { t: 'Faltei à Missa de domingo por culpa minha?' },
          { t: 'Deixei de rezar, ou rezei mal e sem atenção?' },
          { t: 'Usei o nome de Deus sem respeito?' },
          { t: 'Comunguei em pecado grave?' },
        ],
      },
      {
        titulo: 'Com o próximo',
        q: [
          { t: 'Fui impaciente, grosseiro ou injusto com alguém?' },
          { t: 'Menti, falei mal dos outros ou julguei sem motivo?' },
          { t: 'Guardei rancor, ou não quis perdoar?' },
          { t: 'Deixei de ajudar quem precisava?' },
        ],
      },
      {
        titulo: 'Comigo mesmo',
        q: [
          { t: 'Pequei contra a castidade em pensamentos, olhares ou atos?' },
          { t: 'Fui preguiçoso nos meus deveres?' },
          { t: 'Comi, bebi ou usei o celular sem medida?' },
          { t: 'Fui orgulhoso, vaidoso ou invejoso?' },
        ],
      },
    ],
  },

  {
    id: 'criancas',
    titulo: 'Para crianças',
    sub: 'Linguagem simples, para a primeira confissão e a catequese',
    tempo: '5 min',
    filtra: false,
    secoes: [
      {
        titulo: 'Jesus e eu',
        q: [
          { t: 'Esqueci de rezar de manhã ou à noite?' },
          { t: 'Fiquei bagunçando ou brincando na Missa?' },
          { t: 'Falei o nome de Jesus de brincadeira ou com raiva?' },
        ],
      },
      {
        titulo: 'Minha família',
        q: [
          { t: 'Desobedeci o papai, a mamãe ou quem cuida de mim?' },
          { t: 'Respondi mal, fiz birra ou briguei com meus irmãos?' },
          { t: 'Deixei de ajudar em casa quando me pediram?' },
        ],
      },
      {
        titulo: 'Os outros',
        q: [
          { t: 'Bati em alguém, xinguei ou chamei de nome feio?' },
          { t: 'Deixei alguém de fora da brincadeira, ou zombei de alguém?' },
          { t: 'Menti?' },
          { t: 'Peguei alguma coisa que não era minha?' },
          { t: 'Colei na prova ou fiz a lição de qualquer jeito?' },
          { t: 'Tive inveja dos brinquedos ou das coisas dos outros?' },
        ],
      },
    ],
  },
];

export const PASSOS = [
  { t: 'Peça luz ao Espírito Santo', d: 'Antes de começar, reze um momento pedindo para enxergar seus pecados com verdade e sem medo.' },
  { t: 'Faça o exame', d: 'Marque aqui o que você reconhece. Nos pecados graves, lembre também quantas vezes, mais ou menos.' },
  { t: 'Arrependa-se', d: 'O essencial é a dor de ter ofendido a Deus e o propósito firme de não voltar a pecar.' },
  { t: 'Comece a confissão', d: 'Faça o sinal da cruz e diga:', f: 'Abençoe-me, padre, porque pequei. A minha última confissão foi há…' },
  { t: 'Diga os seus pecados', d: 'Com simplicidade e sem rodeios. Ao terminar:', f: 'Por estes e por todos os pecados de que não me lembro, peço perdão a Deus.' },
  { t: 'Ouça o conselho e a penitência', d: 'O padre pode dar uma orientação. Guarde a penitência para cumpri-la logo.' },
  { t: 'Reze o ato de contrição', d: 'Quando o padre pedir. A oração está logo abaixo.' },
  { t: 'Receba a absolvição', d: 'Responda “Amém”. Depois, cumpra a penitência e dê graças a Deus.' },
];

export const CONTRICAO = {
  breve: 'Meu Deus, eu me arrependo de todo o coração de vos ter ofendido, porque sois tão bom e amável. Prometo, com a vossa graça, esforçar-me para ser bom. Meu Jesus, misericórdia!',
  completo: 'Senhor meu Jesus Cristo, Deus e Homem verdadeiro, Criador e Redentor meu, por serdes vós quem sois, sumamente bom e digno de ser amado sobre todas as coisas, e porque vos amo e estimo, pesa-me, Senhor, de todo o meu coração, de vos ter ofendido; e proponho firmemente, ajudado com os auxílios da vossa divina graça, emendar-me e nunca mais vos tornar a ofender; espero alcançar o perdão das minhas culpas pela vossa infinita misericórdia. Amém.',
  latim: 'Deus meus, ex toto corde paenitet me omnium meorum peccatorum, eaque detestor, quia peccando, non solum poenas a Te iuste statutas promeritus sum, sed praesertim quia offendi Te, summum bonum, ac dignum qui super omnia diligaris. Ideo firmiter propono, adiuvante gratia Tua, de cetero me non peccaturum peccandique occasiones proximas fugiturum. Amen.',
};
