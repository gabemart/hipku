/*
** Test that a series of inputs match the outputs
** specified by the current version's dictionaries
** and schemas. Tests must be updated whenever changes
** are made to any dicationary or schema.
*/

var Hipku = require('../../index.js');

describe("The current version of Hipku", function() {

  var Ipv4HipkuIpPairs, Ipv6HipkuIpPairs;

  beforeEach(function() {
    Ipv4HipkuIpPairs = [
      ['0.0.0.0', 'The agile beige ape\naches in the ancient canyon.\nAutumn colors blow.\n'],
      ['127.0.0.1', 'The hungry white ape\naches in the ancient canyon.\nAutumn colors crunch.\n'],
      ['82.158.98.2', 'The fearful blue newt\nwakes in the foggy desert.\nAutumn colors dance.\n'],
      ['255.255.255.255', 'The weary white wolf\nyawns in the wind-swept wetlands.\nYellowwood leaves twist.\n']
    ];  
    
    Ipv6HipkuIpPairs = [
      ['0:0:0:0:0:0:0:0',
        'Ace ants and ace ants\naid ace ace ace ace ace ants.\nAce ants aid ace ants.\n'],
      ['2c8f:27aa:61fd:56ec:7ebe:d03a:1f50:475f',
        'Cursed mobs and crazed queens\nfeel wrong gruff tired moist slow sprats.\nFaint bulls dread fond fruits.\n'],
      ['ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
        'Young yaks and young yaks\ntend young young young young young yaks.\nYoung yaks tend young yaks.\n']
    ];
  });
  
  afterEach(function() {
    Ipv4HipkuIpPairs = null;
    Ipv6HipkuIpPairs = null;
  });

  it("should correctly encode a series of test IPv4 addresses", function() {
    for (var i = 0; i < Ipv4HipkuIpPairs.length; i++) {
      expect(
        Hipku.encode(Ipv4HipkuIpPairs[i][0])
      ).toBe(Ipv4HipkuIpPairs[i][1]); 
    }             
  });

  it("should correctly decode a series of test IPv4 hipku", function() {
    for (var i = 0; i < Ipv4HipkuIpPairs.length; i++) {
      expect(
        Hipku.decode(Ipv4HipkuIpPairs[i][1])
      ).toBe(Ipv4HipkuIpPairs[i][0]); 
    }    
  });

  it("should correctly encode a series of test IPv6 addresses", function() {
    for (var i = 0; i < Ipv6HipkuIpPairs.length; i++) {
      expect(
        Hipku.encode(Ipv6HipkuIpPairs[i][0])
      ).toBe(Ipv6HipkuIpPairs[i][1]); 
    }            
  });

  it("should correctly decode a series of test IPv6 hipku", function() {
    for (var i = 0; i < Ipv6HipkuIpPairs.length; i++) {
      expect(
        Hipku.decode(Ipv6HipkuIpPairs[i][1])
      ).toBe(Ipv6HipkuIpPairs[i][0]); 
    }   
  });    

});