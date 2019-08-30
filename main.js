
    
  $(function () {

    var setCalendar = function(start, end,callback){
      var events = [];
      var ym = start.add(7, 'days').format("YYYYMM"); 
      var item = sessionStorage.getItem('event' + ym);
      if (item) {
        events = JSON.parse(item);
        callback(events);
        return;
      }
      $.when(
        $.ajax({
          url: "https://connpass.com/api/v1/event/?count=100&ym="+ym+"",
          dataType: 'jsonp',
        }),
        $.ajax({
          url: "https://api.atnd.org/events/?count=100&ym="+ym+"&start=1&format=jsonp",
          dataType: 'jsonp',
        })
      )
      .done(function(data1, data2) {

        for (var i in data1[0].events) {
            events.push({
              title: data1[0].events[i].title,
              start: moment(data1[0].events[i].started_at),
              end: moment(data1[0].events[i].ended_at),
              url: data1[0].events[i].event_url,
              description: data1[0].events[i].catch,
              description: ""
                           + "day:" + moment(data1[0].events[i].started_at).format("MM/DD HH:mm") + " - "
                           + "" + moment(data1[0].events[i].ended_at).format("MM/DD HH:mm") + "<br>"
                           + "limit:" + data1[0].events[i].limit + "<br>"
                           + "place:" + data1[0].events[i].place + "<br>"
                           + "address:" + data1[0].events[i].address + "<br>"
                           + "description:" + data1[0].events[i].catch.substring(0,49) + "<br>"
                           + "",

              backgroundColor: '#a82400',
              borderColor: '#a82400'
            });
          
          }

          for (var i in data2[0].events) {
            events.push({
              title: data2[0].events[i].event.title,
              start: moment(data2[0].events[i].event.started_at),
              end: moment(data2[0].events[i].event.ended_at),
              url: data2[0].events[i].event.event_url,
              description: ""
                           + "day:" + moment(data2[0].events[i].event.started_at).format("MM/DD HH:mm") + " - "
                           + "" + moment(data2[0].events[i].event.ended_at).format("MM/DD HH:mm") + "<br>"
                           + "limit:" + data2[0].events[i].event.limit + "<br>"
                           + "place:" + data2[0].events[i].event.place + "<br>"
                           + "address:" + data2[0].events[i].event.address + "<br>"
                           + "description:" + data2[0].events[i].event.description.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'').substring(0,49) + "<br>"
                           + "",
              backgroundColor: '#EBAC2B',
              borderColor: '#EBAC2B'
            });
          }

          sessionStorage.setItem('event'+ym, JSON.stringify(events));
          callback(events);
      })
      .fail(function(a,b) {
          console.log(a);
          console.log(b);
      });
    }

    $('#calendar').fullCalendar({
      header    : {
        left  : 'prev,next today',
        center: 'title',
        right : 'month,agendaWeek,agendaDay'
      },
      buttonText: {
        today: 'today',
        month: 'month',
        week : 'week',
        day  : 'day'
      },
      axisFormat: 'HH:mm',
      timeFormat: 'HH:mm',
      events    : function(start, end, timezone, callback) {
        setCalendar(start, end, callback);        
      },
      editable  : true,
      eventLimit: false,
      selectable:true,
      selectHelper:true,
      eventRender: function(eventObj, $el) {
        var content = eventObj.description || '';
        $el.popover({
          title: eventObj.title,
          content: content,
          trigger: 'hover',
          html: true,
          placement: 'top',
          container: 'body'
        });
      },
      eventClick: function(calEvent, jsEvent, view) {
      },
      dayClick: function(date, jsEvent, view) {
      }
    });
    
  });
