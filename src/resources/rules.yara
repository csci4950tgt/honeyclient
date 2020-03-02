rule digital_skimmer_coffemokko {
    meta:
        description = "CoffeMokko Digital Skimmer"
        author = "Eric Brandel"
        reference = "https://www.group-ib.com/blog/coffemokko"
        date = "2019-10-14"
    strings:
        $re1 = /var _\$_[0-9a-fA-F]{4}=\(function\(.,.\)/
        $re2 = /(\.join\(.\)\.split\(.\)){4}/
        $s1 = "encode:function("
        $s2 = "String.fromCharCode(127)"
        $s3 = "setTimeout"
        $s4 = "_keyStr"
    condition:
        all of them
        and filesize < 500KB
  }

rule digital_skimmer_inter {
  meta:
      description = "Inter Digital Skimmer"
      author = "Eric Brandel"
      reference = ""
      date = "2019-10-16"
  strings:
      $s1 = "SaveParam"
      $s2 = "SaveAllFields"
      $s3 = "SendData"
      $s4 = "TrySend"
      $s5 = "GetCCInfo"
      $s6 = "LoadImage"
      $s7 = "GetImageUrl"
      $s8 = "GetFromStorage"
      // uniqueish strings
      $s9 = "Cookies.set(\"$s\""
      $s10 = "Cookies.get(\"$s\")"
      $s11 = "Cookies.get(\"$sent\")"
  condition:
      6 of them
      and filesize < 500KB
  }

rule generic_javascript_obfuscation {
  meta:
      author = "Josh Berry"
      date = "2016-06-26"
      description = "JavaScript Obfuscation Detection"
      sample_filetype = "js-html"
  strings:
      $string0 = /eval\(([\s]+)?(unescape|atob)\(/ nocase
      $string1 = /var([\s]+)?([a-zA-Z_$])+([a-zA-Z0-9_$]+)?([\s]+)?=([\s]+)?\[([\s]+)?\"\\x[0-9a-fA-F]+/ nocase
      $string2 = /var([\s]+)?([a-zA-Z_$])+([a-zA-Z0-9_$]+)?([\s]+)?=([\s]+)?eval;/
  condition:
      any of them
  }

rule src_ptheft_command {
  meta:
	  description = "Auto-generated rule - file command.js"
	  author = "Pasquale Stirparo"
	  reference = "not set"
	  date = "2015-10-08"
	  hash = "49c0e5400068924ff87729d9e1fece19acbfbd628d085f8df47b21519051b7f3"
  strings:
      $s0 = "var lilogo = 'http://content.linkedin.com/etc/designs/linkedin/katy/global/clientlibs/img/logo.png';" fullword wide ascii /* score: '38.00' */
      $s1 = "dark=document.getElementById('darkenScreenObject'); " fullword wide ascii /* score: '21.00' */
      $s2 = "beef.execute(function() {" fullword wide ascii /* score: '21.00' */
      $s3 = "var logo  = 'http://www.youtube.com/yt/brand/media/image/yt-brand-standard-logo-630px.png';" fullword wide ascii /* score: '32.42' */
      $s4 = "description.text('Enter your Apple ID e-mail address and password');" fullword wide ascii /* score: '28.00' */
      $s5 = "sneakydiv.innerHTML= '<div id=\"edge\" '+edgeborder+'><div id=\"window_container\" '+windowborder+ '><div id=\"title_bar\" ' +ti" wide ascii /* score: '28.00' */
      $s6 = "var logo  = 'https://www.yammer.com/favicon.ico';" fullword wide ascii /* score: '27.42' */
      $s7 = "beef.net.send('<%= @command_url %>', <%= @command_id %>, 'answer='+answer);" fullword wide ascii /* score: '26.00' */
      $s8 = "var title = 'Session Timed Out <img src=\"' + lilogo + '\" align=right height=20 width=70 alt=\"LinkedIn\">';" fullword wide ascii /* score: '24.00' */
      $s9 = "var title = 'Session Timed Out <img src=\"' + logo + '\" align=right height=20 width=70 alt=\"YouTube\">';" fullword wide ascii /* score: '24.00' */
      $s10 = "var title = 'Session Timed Out <img src=\"' + logo + '\" align=right height=24 width=24 alt=\"Yammer\">';" fullword wide ascii /* score: '24.00' */
      $s11 = "var logobox = 'style=\"border:4px #84ACDD solid;border-radius:7px;height:45px;width:45px;background:#ffffff\"';" fullword wide ascii /* score: '21.00' */
      $s12 = "sneakydiv.innerHTML= '<br><img src=\\''+imgr+'\\' width=\\'80px\\' height\\'80px\\' /><h2>Your session has timed out!</h2><p>For" wide ascii /* score: '23.00' */
      $s13 = "inner.append(title, description, user,password);" fullword wide ascii /* score: '23.00' */
      $s14 = "sneakydiv.innerHTML= '<div id=\"window_container\" '+windowborder+ '><div id=\"windowmain\" ' +windowmain+ '><div id=\"title_bar" wide ascii /* score: '23.00' */
      $s15 = "sneakydiv.innerHTML= '<div id=\"window_container\" '+windowborder+ '><div id=\"windowmain\" ' +windowmain+ '><div id=\"title_bar" wide ascii /* score: '23.00' */
      $s16 = "answer = document.getElementById('uname').value+':'+document.getElementById('pass').value;" fullword wide ascii /* score: '22.00' */
      $s17 = "password.keydown(function(event) {" fullword wide ascii /* score: '21.01' */
  condition:
      13 of them
  }

rule possible_includes_base64_packed_functions {
  meta:
      impact = 5
      hide = true
      desc = "Detects possible includes and packed functions"
  strings:
      $f = /(atob|btoa|;base64|base64,)/ nocase
  condition:
      $f
  }

rule dean_edwards : obfuscator {
  meta:
      description = "JavaScript Obfuscation Detection"
      sample_filetype = "js-html"
  strings:
      $s0 = /eval\(function\(p,a,c,k,e,d\){/
      $s1 = /eval\(function\(p,a,c,k,e,r\){/
  condition:
        any of them
  }

rule jsfck : obfuscator {
  meta:
	  description = "JavaScript Obfuscation Detection"
	  sample_filetype = "js-html"
  strings:
	  $s0 = /(\!\[\])+/
	  $s1 = /(\+\[\])+/
  condition:
	  #s0 > 10 and #s1 > 10
 }

rule hacked_by : deface {
  meta:
 	  sample_filetype = "js-html"
  strings:
 	  $s0 = /hacked[ _]by/ nocase
  condition:
 	  any of them
 }
