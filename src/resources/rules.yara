/*
* Some common JS attack rules
*/

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


/*
* detect magecart in HTML bodies
*/

rule magecart {
   meta:
      description = "This rule screens web pages to look for Magecart in script tag sources"
      thread_level = 3
      in_the_wild = true

   strings:
      $scriptopen = "<script "
 	  $scriptclose = "</script>"
 	  $d1 = "magesecuritys.com"
 	  $d2 = "magescripts.pw"
 	  $d3 = "js-cloud.com"
      $d4 = "cdnmage.com"
 	  $d5 = "cdnassels.com"
 	  $d6 = "mypiltow.com"
 	  $d7 = "configsysrc.info"
 	  $d8 = "cmytuok.top"
 	  $d9 = "mcloudjs.com"
 	  $d10 = "magejavascripts.com"
 	  $d11 = "www.js-cloud.com"
 	  $d12 = "www.cdnmage.com"
 	  $d13 = "www.magescripts.pw"
 	  $d14 = "secure.livechatinc.org"

 	condition:
 	  for any i in (1..#scriptopen) : any of ($d*) in (@scriptopen[i]..@scriptclose[i])
 }


/*
* detect xmrig Crypto-Miners
*/

rule MinerGate {
   strings:
     $a1 = "minergate.com"
   condition:
     $a1
 }

rule MoneroOrg {
   strings:
     $a1 = "POOL.MONERO.ORG"
     $a2 = "pool.monero.org"
   condition:
     $a1 or $a2
 }

rule cryptonotepool {
   strings:
     $a1 = "cryptonotepool.org.uk"
   condition:
     $a1
 }

rule minexmr
 {
 strings:
 $a1 = "minexmr.com"
 $a2 = "x.opmoner.com"
 condition:
 $a1 or $a2
 }

rule monerocryptopoolfr
 {
 strings:
 $a1 = "monero.crypto-pool.fr"
 condition:
 $a1
 }

rule monerobackuppoolcom
 {
 strings:
 $a1 = "monero.backup-pool.com"
 condition:
 $a1
 }

rule monerohashcom
 {
 strings:
 $a1 = "monerohash.com"
 condition:
 $a1
 }

rule mropooltobe
 {
 strings:
 $a1 = "mro.poolto.be"
 condition:
 $a1
 }

rule moneroxminingpoolcom
 {
 strings:
 $a1 = "monero.xminingpool.com"
 condition:
 $a1
 }

rule xmrprohashnet
 {
 strings:
 $a1 = "xmr.prohash.net"
 condition:
 $a1
 }

rule dwarfpoolcom
 {
 strings:
 $a1 = "dwarfpool.com"
 condition:
 $a1
 }

rule xmrcryptopoolsorg
 {
 strings:
 $a1 = "xmr.crypto-pools.org"
 condition:
 $a1
 }

rule moneronet
 {
 strings:
 $a1 = "monero.net"
 condition:
 $a1
 }

rule hashinvestnet
 {
 strings:
 $a1 = "hashinvest.net"
 condition:
 $a1
 }

rule stratum_tcp_general
 {
 strings:
 $a1 = "stratum+tcp"
 $a2 = "stratum+udp"
 condition:
 $a1 or $a2
 }


/*
* detect analysis evasion through anti virtualization techniques
*/

rule vmdetect
 {
     meta:
         author = "nex"
         description = "Possibly employs anti-virtualization techniques"

     strings:
         // Binary tricks
         $vmware = {56 4D 58 68}
         $virtualpc = {0F 3F 07 0B}
         $ssexy = {66 0F 70 ?? ?? 66 0F DB ?? ?? ?? ?? ?? 66 0F DB ?? ?? ?? ?? ?? 66 0F EF}
         $vmcheckdll = {45 C7 00 01}
         $redpill = {0F 01 0D 00 00 00 00 C3}

         // Random strings
         $vmware1 = "VMXh"
         $vmware2 = "Ven_VMware_" nocase
         $vmware3 = "Prod_VMware_Virtual_" nocase
         $vmware4 = "hgfs.sys" nocase
         $vmware5 = "mhgfs.sys" nocase
         $vmware6 = "prleth.sys" nocase
         $vmware7 = "prlfs.sys" nocase
         $vmware8 = "prlmouse.sys" nocase
         $vmware9 = "prlvideo.sys" nocase
         $vmware10 = "prl_pv32.sys" nocase
         $vmware11 = "vpc-s3.sys" nocase
         $vmware12 = "vmsrvc.sys" nocase
         $vmware13 = "vmx86.sys" nocase
         $vmware14 = "vmnet.sys" nocase
         $vmware15 = "vmicheartbeat" nocase
         $vmware16 = "vmicvss" nocase
         $vmware17 = "vmicshutdown" nocase
         $vmware18 = "vmicexchange" nocase
         $vmware19 = "vmdebug" nocase
         $vmware20 = "vmmouse" nocase
         $vmware21 = "vmtools" nocase
         $vmware22 = "VMMEMCTL" nocase
         $vmware23 = "vmx86" nocase
         $vmware24 = "vmware" nocase
         $virtualpc1 = "vpcbus" nocase
         $virtualpc2 = "vpc-s3" nocase
         $virtualpc3 = "vpcuhub" nocase
         $virtualpc4 = "msvmmouf" nocase
         $xen1 = "xenevtchn" nocase
         $xen2 = "xennet" nocase
         $xen3 = "xennet6" nocase
         $xen4 = "xensvc" nocase
         $xen5 = "xenvdb" nocase
         $xen6 = "XenVMM" nocase
         $virtualbox1 = "VBoxHook.dll" nocase
         $virtualbox2 = "VBoxService" nocase
         $virtualbox3 = "VBoxTray" nocase
         $virtualbox4 = "VBoxMouse" nocase
         $virtualbox5 = "VBoxGuest" nocase
         $virtualbox6 = "VBoxSF" nocase
         $virtualbox7 = "VBoxGuestAdditions" nocase
         $virtualbox8 = "VBOX HARDDISK"  nocase

         // MAC addresses
         $vmware_mac_1a = "00-05-69"
         $vmware_mac_1b = "00:05:69"
         $vmware_mac_1c = "000569"
         $vmware_mac_2a = "00-50-56"
         $vmware_mac_2b = "00:50:56"
         $vmware_mac_2c = "005056"
         $vmware_mac_3a = "00-0C-29" nocase
         $vmware_mac_3b = "00:0C:29" nocase
         $vmware_mac_3c = "000C29" nocase
         $vmware_mac_4a = "00-1C-14" nocase
         $vmware_mac_4b = "00:1C:14" nocase
         $vmware_mac_4c = "001C14" nocase
         $virtualbox_mac_1a = "08-00-27"
         $virtualbox_mac_1b = "08:00:27"
         $virtualbox_mac_1c = "080027"

     condition:
         any of them
 }
