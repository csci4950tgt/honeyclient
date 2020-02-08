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