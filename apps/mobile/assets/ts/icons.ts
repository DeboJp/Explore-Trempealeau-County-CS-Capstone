/* 
Mapping class for temporary, static image assets.
*/

interface Image {
  name: string;
  image: any;
}

export class Icons {
  private static icons: Array<Image> = [
    {
      name: 'hiking',
      image: require('../media-library/icons/hiking.png'),
    },
    {
      name: 'biking',
      image: require('../media-library/icons/biking.png'),
    },
    {
      name: 'water',
      image: require('../media-library/icons/water.png'),
    },
    {
      name: 'business',
      image: require('../media-library/icons/business.png'),
    },
    {
      name: 'globe',
      image: require('../media-library/icons/globe-solid-full.png'),
    },
    {
      name: 'globe-white',
      image: require('../media-library/icons/globe-solid-full-white.png'),
    },
    {
      name: 'globe-blue',
      image: require('../media-library/icons/globe-solid-full-blue.png'),
    },
    {
      name: 'circle-check',
      image: require('../media-library/icons/circle-check-regular-full.png'),
    },
    {
      name: 'circle-check-white',
      image: require('../media-library/icons/circle-check-regular-full-white.png'),
    },
    {
      name: 'circle-check-blue',
      image: require('../media-library/icons/circle-check-regular-full-blue.png'),
    },
    {
      name: 'circle-check-solid',
      image: require('../media-library/icons/circle-check-solid-full.png'),
    },
    {
      name: 'circle-check-solid-white',
      image: require('../media-library/icons/circle-check-solid-full-white.png'),
    },
    {
      name: 'circle-check-solid-blue',
      image: require('../media-library/icons/circle-check-solid-full-blue.png'),
    },
    {
      name: 'location-pin',
      image: require('../media-library/icons/location-pin-solid-full.png'),
    },
    {
      name: 'location-pin-white',
      image: require('../media-library/icons/location-pin-solid-full-white.png'),
    },
    {
      name: 'thumbtack',
      image: require('../media-library/icons/thumbtack-solid-full.png'),
    },
    {
      name: 'thumbtack-white',
      image: require('../media-library/icons/thumbtack-solid-full-white.png'),
    },
    {
      name: 'map',
      image: require('../media-library/icons/map-location-dot-solid-full.png'),
    },
    {
      name: 'map-white',
      image: require('../media-library/icons/map-location-dot-solid-full-white.png'),
    },
    {
      name: 'star-solid',
      image: require('../media-library/icons/star-solid-full.png'),
    },
    {
      name: 'star-solid-white',
      image: require('../media-library/icons/star-solid-full-white.png'),
    },
    {
      name: 'star-solid-blue',
      image: require('../media-library/icons/star-solid-full-blue.png'),
    },
    {
      name: 'star-outline',
      image: require('../media-library/icons/star-regular-outline.png'),
    },
    {
      name: 'star-outline-white',
      image: require('../media-library/icons/star-regular-outline-white.png'),
    },
    {
      name: 'bookmark-solid',
      image: require('../media-library/icons/bookmark-solid-full.png'),
    },
    {
      name: 'bookmark-solid-white',
      image: require('../media-library/icons/bookmark-solid-full-white.png'),
    },
    {
      name: 'bookmark-outline',
      image: require('../media-library/icons/bookmark-regular-full.png'),
    },
    {
      name: 'bookmark-outline-white',
      image: require('../media-library/icons/bookmark-regular-full-white.png'),
    },
  ];

  static GetIcon = (name: string) => {
    const found = Icons.icons.find(e => e.name === name);
    return found ? found.image : null;
  };
}