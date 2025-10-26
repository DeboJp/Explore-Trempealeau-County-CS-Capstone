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
    {
      name: 'greatriver.png',
      image: require('../media-library/images/greatriver.png'),
    },
    {
      name: 'galesville.png',
      image: require('../media-library/images/galesville.png'),
    },
    {
      name: 'trempealeau_nwr.png',
      image: require('../media-library/images/trempealeau_nwr.png'),
    },
    {
      name: 'buffalo_river.png',
      image: require('../media-library/images/buffalo_river.png'),
    },
    {
      name: 'buffalo_river_trail.png',
      image: require('../media-library/images/buffalo_river_trail.png'),
    }
  ];

  static GetImage = (name: string) => {
    const found = BackgroundImage.images.find(e => e.name === name);
    return found ? found.image : null;
  };
}