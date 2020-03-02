/**
 * JS/jQuery admin/editor script for Typesetter CMS plugin Background Composer 
 * Author: J. Krausz
 * Date: 2020-03-02
 * Version : 1.0-b4
 * 
 */

$(document).on("section_options:loaded", function(e) {
  gpBGC.attach();
}); 

var gpBGC = {

  attach            : function() {}, // inserts the table/header and makes it and "Available Classes" expandible/collapsible
  create            : function() {}, // builds the UI and initalizes the values
  destroy           : function() {}, // kills the UI and collapses the table

  newStyleRow       : function() {}, // creates a "style" attribute row if not present
  newSelectRow      : function() {}, // UI element build function used by create
  newInputRow       : function() {}, // UI element build function used by create
  newCheckRow       : function() {}, // UI element build function used by create

  splitStyles       : function() {}, // splits passed style string into background-styles and others, returns obj { bgStyles : (string), otherStyles : (string) }
  filterStyles      : function() {}, // applies a style string to a "virtual" DOM element and extracts a subset for further processing
  getBgStyles       : function() {}, // returns all background styles as a JS object from a passed DOM element
  combineBgStyles   : function() {}, // returns a combined style declaration from a passed js obj containing separate background values
  setInlineStyles   : function() {}, // transfers all values from the form and merges them into the style attribute input preserving non-bg declarations
  setValue          : function() {}, // used by buttons to one-click-set commonly used input values
  openCssGradGen    : function() {}, // opens Colorzilla CSS Gradient Generator in a new Window

  bgSeparated       : {},            // data object to store separate background styles
  bgImageUrl        : ""             // variable for background image url

};


gpBGC.attach = function() {
  var html = '<div id="gp_background_composer">'
    + '<table class="bordered full_width">'
    + '<thead><tr><th colspan="2">Background Composer</th></tr></thead>'
    + '</table></div>';
  $(html).insertAfter("form#section_attributes_form>table.bordered.full_width").first();

  var exp_col_html = '<div class="gpSA_expandcollapse" title="expand/collapse"></div>';

  var ecBGC = $(exp_col_html)
    .appendTo("#gp_background_composer th")
    .on("click", function() {
      if ($(this).hasClass("gpSA_expanded")) {
        gpBGC.destroy();
      } else {
        $(this).addClass("gpSA_expanded");
        gpBGC.create();
        $("#gp_background_composer tbody").slideDown("fast");
        $("#gp_avail_classes .gpSA_expandcollapse").removeClass("gpSA_expanded");
        $("#gp_avail_classes tbody").slideUp("fast");
      }
    });

  var ecAC = $(exp_col_html)
    .appendTo("#gp_avail_classes th")
    .addClass("gpSA_expanded")
    .on("click", function() {
      $(this).toggleClass("gpSA_expanded");
      $("#gp_avail_classes tbody").slideToggle("fast");
    });
}


gpBGC.destroy = function() {
  $("form#section_attributes_form input.attr_name[value='style']")
    .closest("tr")
    .find(".attr_value")
    .unbind("change keyup");
  $("#gp_background_composer .gpSA_expandcollapse").removeClass("gpSA_expanded");
  $("#gp_background_composer tbody").slideUp("fast", function() {
    $("#gp_background_composer tbody").remove();
  });
  $("#gp_avail_classes .gpSA_expandcollapse").addClass("gpSA_expanded");
  $("#gp_avail_classes tbody").slideDown("fast");
}


gpBGC.create = function() {
  var inline_styles = 
    $("form#section_attributes_form td input.attr_name[value='style']")
    .closest("tr").find(".attr_value").val();

  inline_styles = (typeof(inline_styles) == "undefined") ? "" : inline_styles;
  gpBGC.filterStyles(inline_styles);

  var html = '<tbody id="gpBGC_tbody">';
  html += gpBGC.newInputRow(
    'background-color', 
    'bgcolor_input', 
    gpBGC.bgSeparated.backgroundColor
  );
  html += gpBGC.newInputRow(
    'background-image', 
    'bgimage_input', 
    gpBGC.bgImageUrl
  );
  html += gpBGC.newInputRow(
    'background-position', 
    'bgposition_input', 
    gpBGC.bgSeparated.backgroundPosition
  );
  html += gpBGC.newSelectRow(
    'background-repeat', 
    'bgrepeat_input', 
    ['repeat', 'no-repeat', 'repeat-x', 'repeat-y', 'inherit'],
    gpBGC.bgSeparated.backgroundRepeat
  );
  html += gpBGC.newInputRow(
    'background-size', 
    'bgsize_input', 
    gpBGC.bgSeparated.backgroundSize
  );
  html += gpBGC.newSelectRow(
    'background-attachment', 
    'bgattachment_select', 
    ['scroll', 'fixed', 'local', 'inherit'], 
    gpBGC.bgSeparated.backgroundAttachment
  );
  html += gpBGC.newSelectRow(
    'background-clip', 
    'bgclip_select', 
    ['padding-box', 'border-box', 'content-box', 'inherit'],
    gpBGC.bgSeparated.backgroundClip
  );
  html += gpBGC.newSelectRow(
    'background-origin', 
    'bgorigin_select', 
    ['padding-box', 'border-box', 'content-box', 'inherit'], 
    gpBGC.bgSeparated.backgroundOrigin
  );
  html += '</tbody>';

  gpBGC.tableBody = $(html).appendTo("#gp_background_composer table");

  // init botstrap_colorpicker on #bgcolor_input
  $("#bgcolor_input")
  //.css({ "width" : "164px" })
  .colorpicker()
  .on('hidePicker.colorpicker', function(event){
    $(this).trigger("keyup");
  });


  // re-compose styles on input change
  gpBGC.tableBody.find("input, select").on("change keyup paste", function() {
    gpBGC.setInlineStyles();
  });

} /* create END */


gpBGC.setInlineStyles = function(styles) {
  var bgcss = {
    backgroundAttachment  : gpBGC.tableBody.find("#bgattachment_select").val(),
    backgroundClip        : gpBGC.tableBody.find("#bgclip_select").val(),
    backgroundColor       : gpBGC.tableBody.find("#bgcolor_input").val(),
    backgroundImage       : gpBGC.tableBody.find("#bgimage_input").val(),
    backgroundSize        : gpBGC.tableBody.find("#bgsize_input").val(),
    backgroundOrigin      : gpBGC.tableBody.find("#bgorigin_select").val(),
    backgroundPosition    : gpBGC.tableBody.find("#bgposition_input").val(),
    backgroundRepeat      : gpBGC.tableBody.find("#bgrepeat_input").val()
  };

  // create "style" row in case none exists yet
  var inline_styles_exist = $("form#section_attributes_form input.attr_name[value='style']").length > 0;
  if (!inline_styles_exist) {
    $("form#section_attributes_form a[data-cmd='add_table_row']").closest("tr").before( gpBGC.newStyleRow() );
  }

  var inline_styles_input = $("form#section_attributes_form input.attr_name[value='style']").closest("tr").find(".attr_value");
  inline_styles_input
    .unbind("change keyup")
    .on("change keyup", gpBGC.destroy );
  
  var newStyles = "";
  // retrieve current styles from input
  var currentStyles = inline_styles_input.val();
  currentStyles.trim();
  if (currentStyles.length > 0) { 
    // split current styles to separate background related styles from all others
    var splitStyles = gpBGC.splitStyles(currentStyles);
    // omit background styles from current
    var newStyles = splitStyles.otherStyles;
  }
  // add styles from Background Composer
  newStyles += gpBGC.combineBgStyles(bgcss);
  // set input value
  inline_styles_input.val(newStyles);
}


gpBGC.getBgStyles = function(obj) {
  var bg = {
    backgroundAttachment  : ( $(obj).css("background-attachment") == "initial" ? "scroll" : $(obj).css("background-attachment") ),
    /* backgroundBlendMode   : $(obj).css("background-blend-mode"), */ // 2015: not yet supported by IE/Edge
    backgroundClip        : ( $(obj).css("background-clip") == "initial" ? "border-box" : $(obj).css("background-clip") ),
    backgroundColor       : $(obj).css("background-color"),
    backgroundImage       : $(obj).css("background-image"),
    backgroundSize        : ( $(obj).css("background-size") == "initial" ? "auto" : $(obj).css("background-size") ),
    backgroundOrigin      : ( $(obj).css("background-origin") == "initial" ? "padding-box" : $(obj).css("background-origin") ),
    backgroundPosition    : $(obj).css("background-position"),
    backgroundRepeat      : $(obj).css("background-repeat")
  }
  return bg;
}


gpBGC.combineBgStyles = function(css) {
  var bg_shorthand = 
      ( (css.backgroundColor!="" && css.backgroundColor!="transparent" && css.backgroundColor!="rgba(0,0,0,0)") ? " "+css.backgroundColor : "" )
    + ( (css.backgroundImage!="" && css.backgroundImage!="none") ? " "+css.backgroundImage : "" )
    + ( (css.backgroundRepeat!="repeat") ? " "+css.backgroundRepeat : "" ) 
    + ( (css.backgroundAttachment!="scroll") ? " "+css.backgroundAttachment : "" )
    + ( (css.backgroundPosition!="" && css.backgroundPosition!="0% 0%" && css.backgroundPosition!="0") ? " "+css.backgroundPosition : "" );

  bg_shorthand = (bg_shorthand != "") ? ( "background:" + bg_shorthand + ";" ) : "";

  // separate newer background declarations for older browsers
  var bg_others = 
      ( (css.backgroundSize!="" && css.backgroundSize!="auto" && css.backgroundSize != "auto auto") ? "background-size:"+css.backgroundSize+";" : "" )
    + ( (css.backgroundClip!="padding-box") ? " background-clip:"+css.backgroundClip+";" : ""  )
    + ( (css.backgroundOrigin!="padding-box") ? " background-origin:"+css.backgroundOrigin+";" : "" ) 
    /* + ( (css.backgroundBlendMode!="normal") ? " background-blend-mode:"+css.backgroundBlendMode+";" : "" ) */
    ; 

  var bg_declarations = bg_shorthand + ( (bg_others != "") ? " " + bg_others : "" );

  return bg_declarations;
}


gpBGC.filterStyles = function(styles) {
  var splitStyles = gpBGC.splitStyles(styles);
  // create a temporary DOM element and apply background styles
  var tmpDomElem = $('<div class="gpBGC_tmpDomElem"/>').attr("style", splitStyles.bgStyles);
  // retrieve separate background style values
  gpBGC.bgSeparated = gpBGC.getBgStyles(tmpDomElem);
  // remove double quotes from urls
  gpBGC.bgImageUrl = gpBGC.bgSeparated.backgroundImage.indexOf("://") ? gpBGC.bgSeparated.backgroundImage.replace(/['"]+/g, '') : gpBGC.bgSeparated.backgroundImage ;
}


gpBGC.splitStyles = function(styles) {
  // split style declarations into array and separate background styles
  var bg_styleArray = [];
  var styleArray = styles.length > 0 ? styles.split(";") : [""];
  for (var i=0; i<styleArray.length; i++) {
    styleArray[i] = $.trim(styleArray[i]);
    if (styleArray[i] == "") {
      styleArray.splice(i,1);
      i--;
    } else if (styleArray[i].indexOf('background') != -1) {
      bg_styleArray.push(styleArray[i]);
      styleArray.splice(i,1);
      i--;
    }
  }
  return {
    bgStyles    : (bg_styleArray.length>0 ? bg_styleArray.join("; ")+"; " : ""),
    otherStyles : (styleArray.length>0 ? styleArray.join("; ")+"; " : "")
  }
}


gpBGC.newStyleRow = function() {
  var html = '<tr>';
  html +=    '<td><input class="gpinput attr_name" size="8" value="style"></td>';
  html +=    '<td><textarea class="gptextarea attr_value" rows="1"></textarea></td>';
  html +=    '</tr>';
  return html;
}


gpBGC.newSelectRow = function(label, id, options, val) {
  var html =  '<tr>';
  html +=     '<td><label>' + label + '</label></td>';
  html +=     '<td><select class="gpselect" id="' + id + '">';
  $.each(options, function(i,v) {
    html +=   '<option value="' + v + '"' + ( v == val ?  ' selected="selected"' : '') + '>';
    html +=   v + (i==0 ? ' (default)' : '');
    html +=   '</option>';
  });
  html +=     '</select></td>';
  html +=     '</tr>';
  return html;
}


gpBGC.newInputRow = function(label, id, val) {
  var html =  '<tr>';
  html +=     '<td><label>' + label + '</label></td>';

  html +=     '<td>';
  switch (label) {

    case "background-color":
      html +=   '<input class="gpinput" type="text" size="16" id="'+id+'" value=\''+val+'\'/>';
      html +=   '<a title="unset value" class="gpbutton" onClick="gpBGC.setValue($(\'#'+id+'\'),\'\')"><i class="fa fa-times"></i></a> ';
      break;

    case "background-image":
      html +=   '<input class="gpinput" type="text" size="16" id="'+id+'" value=\''+val+'\'/>';
      html +=   '<a title="get image using finder" class="gpbutton" onClick="gpBGC.getURLfromFinder()">Browse Server</a> ';
      html +=   '<a id="gpBGC_openCGG" title="open Colorzilla Gradient Generator" class="gpbutton" href="javascript:gpBGC.openCssGradGen()">&nbsp;</a> ';
      html +=   '<a title="unset value" class="gpbutton" onClick="gpBGC.setValue($(\'#'+id+'\'),\'\')"><i class="fa fa-times"></i></a> ';
      break;

    case "background-position":
      html +=   '<input class="gpinput" type="text" size="16" id="'+id+'" value=\''+val+'\'/>';
      html +=   '<a class="gpbutton" onClick="gpBGC.setValue($(\'#'+id+'\'),\'50% 50%\')">center</a> ';
      html +=   '<a title="unset value" class="gpbutton" onClick="gpBGC.setValue($(\'#'+id+'\'),\'\')"><i class="fa fa-times"></i></a> ';
      break;

    case "background-size":
      html +=   '<input class="gpinput" type="text" size="16" id="'+id+'" value=\''+val+'\'/>';
      html +=   '<a class="gpbutton" onClick="gpBGC.setValue($(\'#'+id+'\'),\'auto auto\')">auto</a> ';
      html +=   '<a class="gpbutton" onClick="gpBGC.setValue($(\'#'+id+'\'),\'cover\')">cover</a> ';
      html +=   '<a class="gpbutton" onClick="gpBGC.setValue($(\'#'+id+'\'),\'contain\')">contain</a> ';
      html +=   '<a title="unset value" class="gpbutton" onClick="gpBGC.setValue($(\'#'+id+'\'),\'\')"><i class="fa fa-times"></i></a> ';
      break;

    default :
      html +=   '<input class="gpinput" type="text" size="40" id="'+id+'" value=\''+val+'\'/>';
  }

  html +=     '</td>';
  html +=     '</tr>';
  return html;
}


gpBGC.newCheckRow = function(label, id, checked) {
  var html =  '<tr>';
  html  +=    '<td><label>' + label + '</label></td>';
  html  +=    '<td><input class="gpcheckbox" type="checkbox" id="' + id + '" ' + ( checked ?  ' checked="checked"' : '') + '/></td>';
  html  +=    '</tr>';
  return html;
}


gpBGC.getURLfromFinder = function() {
  if ( typeof(gpFinderUrl) == "undefined" ){
    alert("Error: gpFinderUrl is not defined");
    return false;
  }
  // create a faux CKEDITOR object to handle gpFinder file select callback ;-)
  if( window.CKEDITOR ){
    window.CKEDITOR_BACKUP = window.CKEDITOR;
  }
  window.CKEDITOR = {
    tools : {
      callFunction : function(funcNum,fileUrl) {
        if( fileUrl != "" ){
          $("#bgimage_input").val('url(\'' + fileUrl + '\')');
          gpBGC.setInlineStyles();
        }
        // restore CKEDITOR backup
        if( window.CKEDITOR_BACKUP ){
          window.CKEDITOR = window.CKEDITOR_BACKUP;
        }
        return true;
      }
    }
  };

  // open new gpFinder popup window
  var new_gpFinder = window.open(gpFinderUrl, 'gpFinder', 'menubar=no,width=960,height=640');
  if (window.focus) {
    new_gpFinder.focus();
  }
}


gpBGC.setValue = function(jQo,v) {
  jQo.val(v).trigger("change");
}


gpBGC.openCssGradGen = function() {
  var gradientGenerator = window.open('http://www.colorzilla.com/gradient-editor/', 'gradientGenerator');
  if( window.focus ){
    gradientGenerator.focus();
  }
}
