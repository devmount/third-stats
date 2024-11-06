// this script holds all background activity not related to stats building

const main = async () => {
  // add icon to spaces toolbar
  if (messenger.spaces) {
    await messenger.spaces.create(
      'third_stats',
      '../index.stats.html',
      {
        badgeBackgroundColor: '#e64db9',
        badgeText: '',
        defaultIcons: '../icon.svg',
        themeIcons: [
          {
            dark: '../icon-dark.svg',
            light: '../icon-light.svg',
            size: 16
          },
          {
            dark: '../icon-dark.svg',
            light: '../icon-light.svg',
            size: 32
          }
        ],
        title: 'ThirdStats',
      }
    );
  }
};

main();
