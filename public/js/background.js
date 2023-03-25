// this script holds all background activity not related to stats building

function main() {
  // add icon to spaces toolbar
  if (messenger.spacesToolbar) {
    messenger.spacesToolbar.addButton(
      'third_stats',
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
        url: '../stats.html'
      }
    );
  }
}

main();
