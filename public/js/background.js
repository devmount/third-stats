// this script holds all background activity not related to stats building

function main() {
  // add icon to spaces toolbar
  if (messenger.spacesToolbar) {
    messenger.spacesToolbar.addButton(
      'third_stats',
      {
        badgeBackgroundColor: '#e64db9',
        badgeText: '',
        defaultIcons: '',
        title: 'ThirdStats',
        url: '../stats.html?s=sum'
      }
    );
  }
}

main();
