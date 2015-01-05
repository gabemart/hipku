/*
** Test that a given input results in an output that can
** be decoded to match the original input. Applicable to
** all versions.
*/

var Hipku = require('../../index.js');

describe("All versions of Hipku", function() {
  
  it("should symetrically encode and decode IPv4 addresses", function() {   
    expect(
      Hipku.decode(Hipku.encode('0.0.0.0'))
    ).toBe('0.0.0.0');

    expect(
      Hipku.decode(Hipku.encode('127.0.0.1'))
    ).toBe('127.0.0.1');
    
    expect(
      Hipku.decode(Hipku.encode('82.158.98.2'))
    ).toBe('82.158.98.2');    
    
    expect(
      Hipku.decode(Hipku.encode('255.255.255.255'))
    ).toBe('255.255.255.255');  
  });
  
  it("should symetrically encode and decode IPv6 addresses", function() { 

    expect(
      Hipku.decode(Hipku.encode('0:0:0:0:0:0:0:0'))
    ).toBe('0:0:0:0:0:0:0:0');

    expect(
      Hipku.decode(Hipku.encode('2c8f:27aa:61fd:56ec:7ebe:d03a:1f50:475f'))
    ).toBe('2c8f:27aa:61fd:56ec:7ebe:d03a:1f50:475f');

    expect(
      Hipku.decode(Hipku.encode('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff'))
    ).toBe('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff');       
  });
  
  it("should correctly expand the abbreviated IPv6 format", function() {
  
    var fullAddress = '0:0:0:0:0:0:0:0';
    
    expect(
      Hipku.decode(Hipku.encode('::0'))
    ).toBe(fullAddress);
    
    expect(
      Hipku.decode(Hipku.encode('0::'))
    ).toBe(fullAddress);    

    expect(
      Hipku.decode(Hipku.encode('0::0'))
    ).toBe(fullAddress);
    
    expect(
      Hipku.decode(Hipku.encode('0:0::0:0'))
    ).toBe(fullAddress);
  
  });
  
});