/* 
Mapping class for temporary, static image assets.
*/

interface Image {
  name: string;
  image: any;
}

export class BackgroundImage {
  private static images: Array<Image> = [
    {
      name: 'perrot.png',
      image: require('../media-library/images/perrot.png'),
    },
    {
      name: 'perrotridge.png',
      image: require('../media-library/images/perrotridge.png'),
    },
    {
      name: 'tamarackcreek.png',
      image: require('../media-library/images/tamarackcreek.png'),
    },
    {
      name: 'longlake.png',
      image: require('../media-library/images/longlake.png'),
    },
  ];

  static GetImage = (name: string) => {
    const found = BackgroundImage.images.find(e => e.name === name);
    return found ? found.image : null;
  };
}