{
  passcode = ''; 
  simulators = {
    'gspro': {
      // foreGroundAppName: if the process in the foreground matches this name
      'foregroundAppName': 'GSpro',
       'segments': {
         'scoreboard': {X: 0, Y: 0, W: 990, H: 180},
         'map': {X: 3226,Y: 954, W: 597, H: 1400, touch: 'restrict'}, 
         'putt': {X: 1459, Y: 635, W: 900,H: 1866, touch: 'restrict'}
       },
       'main': [
          'map', 'putt'
       ], 
       'top': 'scoreboard'
    }
   };
}