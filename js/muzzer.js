jQuery(document).ready(function($) { //an IIFE so safely alias jQuery to $
    $.Muzzer = function(element) {
        this.element = (element instanceof $) ? element : $(element);
    }

    $.Muzzer.prototype =  {
      /**
        Init muzzer class
      **/
      init: function(config) {
        $.extend(this.config, config);
        var that = this;
        this.buildTabs();
        this.loadData(true);
        this.loadClosestItem();
        if (!this.config.customGrid) {
          this.addGrid();
        }
        $("#muzzer-grid").css({"position": "relative", "top": "50px"});
      },

      config: {
        content: {
          size: `
          <div id="ruler-left"></div>
          <div id="outer">
            <div id="inner" class="ui-widget-content">
            <div id="closest_item">
              <img id="closest_item_image">
            </div>
            </div>
          </div>
          <div id="ruler-bottom"></div>
          <div id="parameters">
            <span>Délka:</span><input disabled="disabled" style="display: inline-block;" id="m_width" name="muzzer_numeric" placeholder="0" type="text"><span class="unit">cm</span>
            <span>Výška:</span><input disabled="disabled" style="display: inline-block;" id="m_height" name="muzzer_numeric" placeholder="0" type="text"><span class="unit">cm</span>
            <div hidden><span>D:</span><input disabled="disabled" style="display: inline-block;" id="m_depth" name="muzzer_numeric" placeholder="0" type="text"><span class="unit">cm</span></div>
          </div>`,
          color: "",
          price: `<div id="price_wrap">
            <div id="slider-range"></div>
            <div>
              <div id="range_from">from</div>
              <div id="range_to">to</div>
            </div>
          </div>`,
        },
        priceRange: {from: 0, to: 100000000},
        widthRange: {from: 0, to: 100000000},
        heightRange: {from: 0, to: 100000000},
        currency: " Kč",
        item: "",
        customGrid: false,
        default: {w: 200, h: 200},
        imageMinWidth: 100
      },

      vars: {
        selectedColor: "black",
        selectedPrice: {from: 0, to: 100000000},
        selectedSize: {x: 100, y: 100},
        calculatedSize: {x: 0, y: 1000},
        page: 1
      },
      state: {
        lastElement: false,
        currentCall: null
      },
      /**
        Build tabs as dom
      **/
      buildTabs: function() {
        var that = this;
        var tabData = [
          {id: "size" , name: "Rozměry"},
          //{id: "color", name: "Color"},
          {id: "price", name: "Cena"}
        ]
        var muzzerControl = $("<div>", {id: "muzzer-control"});

        var tabs = $("<div>", {class: "tab"})
        $(tabData).each(function() {
          var button = $("<button>", {class: "tablinks", id: this.id}).html(this.name);
          button.bind("click", function() {
            $(".tab button").removeClass("active");
            $(this).addClass("active");
            that.openTab($(this));
          });
          tabs.append(button);
        })
        tabs.appendTo(that.element);

        $(tabData).each(function() {
            var title = $("<h1>").html(this.name);
            var tabContent = $("<div>", {class: "tabContent", id: this.id});//.append(title);
            if (this.id == "size" && that.config.content.size.length) {
              tabContent.append(that.config.content.size);
            }
            if (this.id == "price" && that.config.content.price.length) {
              tabContent.append(that.config.content.price);
            }
            tabContent.appendTo(muzzerControl);
            that.element.append(muzzerControl);
            that.setupLogicForTab(this.id);
            tabContent.hide();
        })

        $(".tabContent").first().show();

        // $(window).on('resize', function(){
        //
        //     $("#muzzer-control").css({
        //        //transform: "scale("+scale+")"
        //     });
        // });
      },
      setupRulers: function() {
        var that = this;

        var tickWidth = 50;

        // -- ruler horizontal
        var wNumberOfTicks = Math.floor(that.config.widthRange.to/tickWidth);
        var wTickOffSet = Math.floor($("#outer").innerWidth()/wNumberOfTicks);

        var ruler_horizontal = $("<table>", {id: "muzzer-ruler-horizontal"})
        var w_row_ticks = $("<tr>")
        w_row_ticks.html("");
        var w_row_labels = $("<tr>")


        for (var i = 0; i < wNumberOfTicks; i++) {
          var column = $("<td>", {width: wTickOffSet});
          w_row_ticks.append(column)
          var column_label = $("<td>", {class: "unit", width: wTickOffSet});
          column_label.html(i*tickWidth);
          w_row_labels.append(column_label);
        }


        // appendage of all elements
        ruler_horizontal.append(w_row_ticks);
        ruler_horizontal.append(w_row_labels);
        $("#ruler-bottom").append(ruler_horizontal);
        $("#ruler-bottom tr:first-of-type td:first-of-type").css("border-left", "1px solid black")
        // -- ruler vertical
        var hNumberOfTicks = Math.floor(that.config.heightRange.to/tickWidth);
        var hTickOffSet = Math.floor($("#outer").innerHeight()/hNumberOfTicks);

        var ruler_horizontal = $("<table>", {id: "muzzer-ruler-vertical"})
        var h_row_ticks = $("<tr>")
        h_row_ticks.html("");
        var h_row_labels = $("<tr>")

        for (var i = 0; i < hNumberOfTicks; i++) {
          var row = $("<tr>");
          var column_label = $("<td>", {class: "unit", height: wTickOffSet});
          column_label.html((hNumberOfTicks*tickWidth)-(i*tickWidth));
          row.append(column_label);
          var column = $("<td>", {height: hTickOffSet});
          row.append(column);
          h_row_ticks.append(row);
        }

        var ruler_vertical = $("<table>", {id: "muzzer-ruler-vertical"})
        ruler_vertical.append(h_row_ticks);
        $("#ruler-left").append(ruler_vertical);
      },
      /** open tab event **/
      openTab: function(currentTab) {
          $(".tabContent").hide();
          var tabId = "div#"+$(currentTab).attr("id");
          $(tabId).show();
      },
      executeSizer: function() {
        this.vars.page = 1;
        this.vars.selectedSize.x = Math.ceil(this.config.widthRange.to*($("#inner").outerWidth() / $("#outer").innerWidth()));
        this.vars.selectedSize.y = Math.ceil(this.config.heightRange.to*($("#inner").outerHeight() / $("#outer").innerHeight()));
        $("#inner").position({
          my: "left bottom",
          at: "left bottom",
          of: "#outer"
        });
        $("#muzzer-grid").html("");
        this.updateSizeData();
        this.loadData(false);
      },
      setupLogicForTab: function(id) {
        var that = this;
        if (id == "size") {
          $("#inner").resizable({
            resize: function(event, ui) {
              that.executeSizer();
              that.loadClosestItem();
            },
            // stop: function(event, ui) {
            //   that.executeSizer(false);
            // },
            handles: "ne",
            containment: "#outer",
            minHeight: Math.floor(((that.config.heightRange.from / that.config.heightRange.to))*$("#outer").innerHeight()),
            minWidth: Math.floor(((that.config.widthRange.from / that.config.widthRange.to))*$("#outer").innerWidth()),
            maxWidth: $("#outer").innerWidth(),
            maxHeight: $("#outer").innerHeight()
          });

          $('input[name="muzzer_numeric"]').keyup(function(e) {
          if (/\D/g.test(this.value))
              {
                this.value = this.value.replace(/\D/g, '');
              }
          });

          that.setupRulers();
          // $("#m_width, #m_height").on('propertychange change input',function(e){
          //   that.updateInputs();
          // });
        }

        if (id == "price") {
          $( "#slider-range" ).slider({
            classes: {
              "ui-slider": "muzzer-slider",
              "ui-slider-handle": "muzzer-slider-handle",
              "ui-slider-range": "muzzer-slider-range"
            },
            range: true,
            min: that.config.priceRange.from,
            max: that.config.priceRange.to,
            values: [ that.config.priceRange.from, that.config.priceRange.to ],
            slide: function( event, ui ) {
              $("#muzzer-grid").html("");
              that.vars.selectedPrice.from = ui.values[0]
              that.vars.selectedPrice.to = ui.values[1]
              $("#range_from").html(that.formatPrice(ui.values[0]) + that.config.currency);
              $("#range_to").html(that.formatPrice(ui.values[1]) + that.config.currency);
              that.loadData(false, true)
            }
          });
          $(".ui-slider-horizontal .ui-slider-range").css({height: "2px"})
          $(".muzzer-slider-handle").css({top: "-14px", backgroundColor: "#fff", borderRadius: "50%", border: "1px solid black", width: "28px", height: "28px"})
          $( "#range_from" ).html( that.formatPrice($( "#slider-range" ).slider( "values", 0 )) + that.config.currency);
          $( "#range_to" ).html( that.formatPrice($( "#slider-range" ).slider( "values", 1 )) + that.config.currency);
        }

        $(window).scroll(function () {
          function elementScrolled(elem)
          {
            if (elem.length) {
              var docViewTop = $(window).scrollTop();
              var docViewBottom = docViewTop + $(window).height();

              var elemTop = $(elem).offset().top;
              return ((elemTop <= docViewBottom) && (elemTop >= docViewTop));
            }
            return false;
          }

          if (elementScrolled($("#muzzer-grid li").last()) && !that.state.lastElement) {
            that.state.lastElement = true
            that.vars.page = that.vars.page + 1;
            that.loadData(false)
          }
        });
      },
      addGrid: function() {
        $("<div>", {id: "muzzer-grid"}).appendTo(this.element);
      },
      initDefaults: function(width, height) {
        $("#m_width").val(width)
        $("#m_height").val(height)
        this.setupDefaults()
      },
      loadData: function(isInit, updateSizer) {
        // test do not delete
        if (this.state.currentCall) {
          this.state.currentCall.abort();
        }
        if (isInit) {
          this.initDefaults(this.config.default.w, this.config.default.h)
          $("#muzzer-grid").html()
          $(".tab button").first().addClass("active");
        }

        var url = "https://sajzer.muzza.cz/pohovky?_page="+this.vars.page+"&_limit=15&_sort=length,height,price&_order=desc&length_lte="+this.vars.selectedSize.x+"&height_lte="+this.vars.selectedSize.y+"&price_lte="+this.vars.selectedPrice.to+"&price_gte="+this.vars.selectedPrice.from;
        var that = this;
        this.state.currentCall = $.getJSON( url, {
          format: "json"
        }, function(data) {
          if(!data.length) return;
          if (updateSizer) {
            console.log(data[0])
            that.initDefaults(data[0].length, data[0].height)
            that.updateClosestItem(data[0].image)
          }
          var template = $.templates(that.config.item);
          $.each(data, function(index, object) {
            object.price = that.formatPrice(object.price);
            var itemHtml = template.render(object);
            $("#muzzer-grid").append(itemHtml);
          });
          that.state.lastElement = false
        });
      },
      loadClosestItem: function() {
        var url = "https://sajzer.muzza.cz/pohovky?_page=1&_limit=1&_sort=length,height,price&_order=desc&length_lte="+this.vars.selectedSize.x+"&height_lte="+this.vars.selectedSize.y+"&price_lte="+this.vars.selectedPrice.to+"&price_gte="+this.vars.selectedPrice.from;
        var that = this;
        $.getJSON( url, {
          format: "json"
        }, function(data) {
          if(!data.length) return;
          that.updateClosestItem(data[0].image)
        });
      },
      updateClosestItem: function(imageUrl) {
        $("#closest_item").css("max-width", $("#inner").innerWidth());
        $("#closest_item").css("min-width", this.config.imageMinWidth);
        $("#closest_item").css("height", $("#inner").innerHeight());
        var sizerImage = imageUrl.replace("https://www.muzza.cz/wp-content/uploads", "https://www.muzza.cz/media/crop/0/320")
        $("#closest_item_image").attr("src", sizerImage)
      },
      setupDefaults: function() {
        this.vars.selectedSize.x = $("#m_width").val();
        var innerWidth = Math.ceil((this.vars.selectedSize.x / this.config.widthRange.to)*$("#outer").innerWidth());//.toFixed(2);
        $("#inner").outerWidth(innerWidth)
        this.vars.selectedSize.y = $("#m_height").val();
        var innerHeight = Math.ceil((this.vars.selectedSize.y / this.config.heightRange.to)*$("#outer").innerHeight());//.toFixed(2);
        $("#inner").outerHeight(innerHeight);
        $("#inner").position({
          my: "left bottom",
          at: "left bottom",
          of: "#outer"
        });
      },
      updateSizeData: function() {
        $("#m_width").val(this.vars.selectedSize.x)
        $("#m_height").val(this.vars.selectedSize.y)
        $("#m_depth").val(0)
      },
      formatPrice: function(nStr) {
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
          while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ' ' + '$2');
          }
          return x1 + x2;
      }
    }

    var Muzzer = new $.Muzzer("#muzzer");
      var config = {
        item: `<li class="product-warp-item nasa-ver-buttons">
              <div class="product type-product purchasable product-type-simple product-item grid wow fadeInUp hover-fade" data-wow="fadeInUp" data-wow-duration="1s" data-wow-delay="0ms">
                <div class="product-img-wrap">
                  <a class="product-img" href="{{:url}}" title="{{:title}}">
                    <div class="main-img">
                      <img width="650" height="522" src="{{:image}}" class="attachment-shop_catalog size-shop_catalog">
                    </div>
                  </a>
                </div>
                <div class="product-info-wrap info">
                  <a class="name" href="{{:url}}" title="{{:title}}">{{:title}}</a>
                <div class="price-wrap">
                  <span class="price">
                    <span class="woocommerce-Price-amount amount"><bdi>
                    {{:price}}&nbsp;<span class="woocommerce-Price-currencySymbol">Kč</span></bdi>
                  </span></span>
                </div>
                <span class="muzza_size_tag">D: {{:length}} x H: {{:width}} x V: {{:height}} cm</span>
                </div>
                </div>
            </li>`, // Item template with respective placeholders to bind to json
    priceRange: {from: 2000, to: 100000}, // range of possible values for price
        widthRange: {from: 50, to: 400}, // range of possible values for width
        heightRange: {from: 50, to: 100}, // range of possible values for height
        customGrid: false, // if true you can drop any element with id: "grid" that will be used as result list
        default: {w: 246, h: 100}, // default values for init data load
        imageMinWidth: 100 // minimum allowed image width
      }
      Muzzer.init(config); // start
});
