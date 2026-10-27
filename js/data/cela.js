// A Cela: uma pergunta de exame por noite.
// Perguntas escritas para o Lumen, no espírito do exame de consciência diário (o "exame da noite"
// da tradição cristã) e do Catecismo da Igreja Católica. São convites à reflexão, não acusações:
// servem para olhar o dia com Deus, sem escrúpulo.

export const TEMAS = {
  deus: 'Deus',
  proximo: 'O próximo',
  eu: 'Eu mesmo',
  gratidao: 'Gratidão',
  virtude: 'Virtudes',
  casa: 'Em casa',
  trabalho: 'No trabalho e no estudo',
};

export const PERGUNTAS = [
  // Deus
  { c: 'deus', t: 'Hoje, em que momento lembrei de Deus sem que ninguém me lembrasse?' },
  { c: 'deus', t: 'Rezei com atenção, ou só cumpri a oração para me livrar dela?' },
  { c: 'deus', t: 'Deixei Deus falar hoje, ou só falei eu?' },
  { c: 'deus', t: 'O que ocupou o primeiro lugar no meu coração hoje?' },
  { c: 'deus', t: 'Em que acontecimento do dia posso reconhecer a mão de Deus, mesmo que eu não tenha percebido na hora?' },
  { c: 'deus', t: 'Tive vergonha da minha fé diante de alguém? O que me deu medo?' },
  { c: 'deus', t: 'Confiei em Deus nas minhas preocupações, ou tentei carregar tudo sozinho?' },
  { c: 'deus', t: 'Usei o nome de Deus com respeito hoje?' },
  { c: 'deus', t: 'Se Jesus tivesse caminhado comigo hoje, o que ele teria visto de que eu me orgulharia? E de que eu teria vergonha?' },
  { c: 'deus', t: 'Qual foi o meu momento de maior silêncio hoje? Faltou silêncio?' },

  // O próximo
  { c: 'proximo', t: 'Quem precisou de mim hoje e eu não percebi, ou fingi não perceber?' },
  { c: 'proximo', t: 'Houve alguém a quem eu devia um pedido de perdão ou uma palavra de carinho?' },
  { c: 'proximo', t: 'Falei mal de alguém que não estava presente? Por quê?' },
  { c: 'proximo', t: 'Há alguém a quem eu ainda guardo mágoa? Consigo rezar por essa pessoa esta noite?' },
  { c: 'proximo', t: 'Fui paciente com quem me irritou, ou deixei a irritação decidir por mim?' },
  { c: 'proximo', t: 'Escutei de verdade alguém hoje, sem olhar o celular e sem pensar na minha resposta?' },
  { c: 'proximo', t: 'Fiz alguém sorrir hoje? Poderia ter feito mais?' },
  { c: 'proximo', t: 'Fui justo com todos, ou favoreci quem me agrada?' },
  { c: 'proximo', t: 'Disse a verdade com caridade, ou usei a verdade para ferir?' },
  { c: 'proximo', t: 'Passei por algum pobre, doente ou solitário sem lhe dar atenção?' },
  { c: 'proximo', t: 'Julguei alguém depressa demais? E se eu soubesse a história inteira?' },
  { c: 'proximo', t: 'Quem eu preciso agradecer e ainda não agradeci?' },

  // Eu mesmo
  { c: 'eu', t: 'Como eu estava por dentro hoje: em paz, ansioso, cansado, irritado? O que isso me diz?' },
  { c: 'eu', t: 'Qual pensamento voltou várias vezes à minha cabeça hoje? De onde ele vem?' },
  { c: 'eu', t: 'Cuidei do meu corpo e do meu descanso como de um dom de Deus?' },
  { c: 'eu', t: 'Em que me deixei levar pela preguiça ou pela distração?' },
  { c: 'eu', t: 'Quanto tempo gastei no celular e nas redes sociais? Valeu a pena?' },
  { c: 'eu', t: 'Comi, bebi ou comprei por ansiedade, e não por necessidade?' },
  { c: 'eu', t: 'O que vi, ouvi ou li hoje alimentou a minha alma ou a esvaziou?' },
  { c: 'eu', t: 'Fui eu mesmo hoje, ou usei uma máscara para agradar?' },
  { c: 'eu', t: 'De que preciso me despedir esta noite para dormir em paz?' },
  { c: 'eu', t: 'Fui honesto comigo mesmo sobre algo que venho adiando?' },
  { c: 'eu', t: 'Onde fui duro demais comigo mesmo? Deus me olha com mais misericórdia do que eu.' },
  { c: 'eu', t: 'Cuidei da pureza do meu olhar e dos meus pensamentos?' },

  // Gratidão
  { c: 'gratidao', t: 'Quais três coisas boas aconteceram hoje, por menores que sejam?' },
  { c: 'gratidao', t: 'Que pessoa foi um presente de Deus para mim hoje?' },
  { c: 'gratidao', t: 'O que comi, vesti ou usei hoje que muita gente não tem?' },
  { c: 'gratidao', t: 'Que dificuldade de hoje pode ter sido uma lição? O que ela quis me ensinar?' },
  { c: 'gratidao', t: 'Que momento de beleza vi hoje: uma pessoa, um céu, uma música?' },
  { c: 'gratidao', t: 'Pelo que eu reclamei hoje e que, olhando bem, é uma graça?' },
  { c: 'gratidao', t: 'Que pequeno gesto de bondade recebi hoje?' },
  { c: 'gratidao', t: 'Qual foi o melhor momento do meu dia? Como agradeço por ele?' },

  // Virtudes
  { c: 'virtude', t: 'Onde o orgulho apareceu hoje: em querer ter razão, em querer ser visto, em não aceitar ajuda?' },
  { c: 'virtude', t: 'Em que momento fui humilde? Em que momento deveria ter sido?' },
  { c: 'virtude', t: 'Tive inveja de alguém? O que essa inveja revela que eu desejo de verdade?' },
  { c: 'virtude', t: 'Fui generoso com o meu tempo, com o meu dinheiro e com a minha atenção?' },
  { c: 'virtude', t: 'Exagerei na raiva? O que estava por trás dela?' },
  { c: 'virtude', t: 'Fui fiel à minha palavra, ao que prometi?' },
  { c: 'virtude', t: 'Onde precisei de coragem hoje, e agi ou fugi?' },
  { c: 'virtude', t: 'Tive esperança hoje, mesmo quando as coisas não estavam bem?' },
  { c: 'virtude', t: 'Fui sóbrio nos meus gostos, no que comi, comprei e disse?' },
  { c: 'virtude', t: 'Em que acontecimento de hoje exercitei a paciência?' },

  // Em casa
  { c: 'casa', t: 'Fui o rosto de Cristo para quem mora comigo hoje?' },
  { c: 'casa', t: 'Dei às pessoas de casa o meu melhor, ou só o que sobrou do meu cansaço?' },
  { c: 'casa', t: 'Rezei com alguém da minha família, ou ao menos por eles?' },
  { c: 'casa', t: 'Ajudei nas tarefas da casa sem esperar que me pedissem?' },
  { c: 'casa', t: 'Houve alguma palavra dura em casa que preciso reparar amanhã?' },
  { c: 'casa', t: 'Dei atenção a quem mais precisa de mim em casa: filhos, pais, esposo ou esposa?' },
  { c: 'casa', t: 'Mostrei aos meus que os amo, com palavras ou com gestos?' },

  // Trabalho e estudo
  { c: 'trabalho', t: 'Fiz meu trabalho ou meu estudo com honestidade e capricho, como quem serve a Deus?' },
  { c: 'trabalho', t: 'Enganei, exagerei ou escondi a verdade para me sair bem?' },
  { c: 'trabalho', t: 'Tratei bem quem trabalha comigo, acima ou abaixo de mim?' },
  { c: 'trabalho', t: 'Perdi tempo que não era meu? Adiei o que devia fazer?' },
  { c: 'trabalho', t: 'Ofereci a Deus as dificuldades do meu trabalho hoje?' },
  { c: 'trabalho', t: 'Ajudei um colega sem esperar nada em troca?' },
  { c: 'trabalho', t: 'Usei meus talentos, ou os deixei enterrados por medo?' },
];

export const ABERTURA = [
  'Sente-se em silêncio e respire fundo algumas vezes.',
  'Lembre-se de que Deus está aqui e quer olhar o seu dia com você.',
];

// Cada noite: o que fazer, em ordem
export const PASSOS_CELA = [
  { t: 'Silêncio', d: 'Fique um minuto quieto. Não é preciso dizer nada.' },
  { t: 'Gratidão', d: 'Agradeça a Deus por uma coisa que aconteceu hoje.' },
  { t: 'A pergunta', d: 'Leia a pergunta de hoje e responda a Deus, sem pressa.' },
  { t: 'Perdão', d: 'Peça perdão pelo que ficou a dever e perdoe quem te feriu.' },
  { t: 'Entrega', d: 'Entregue o dia nas mãos de Deus e descanse.' },
];

// Frase de despedida (Lc 23,46, a oração que a Igreja reza nas Completas)
export const DESPEDIDA = {
  texto: 'Senhor, em tuas mãos entrego o meu espírito.',
  ref: 'Lc 23,46',
  boa: 'Boa noite. Que Deus guarde o seu sono.',
};
