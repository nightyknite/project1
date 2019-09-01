document.addEventListener("DOMContentLoaded", function(){
    
    const setCalendar = (start, end, callback) => {
      let events = [];
      const ym = start.add(7, 'days').format("YYYYMM"); 
      const item = sessionStorage.getItem('event' + ym);
      if (item) {
        events = JSON.parse(item);
        callback(events);
        return;
      }
      const connpass = data => {
        let event = [];
        for (var i in data.events) {
          event.push({
            title: data.events[i].title,
            start: moment(data.events[i].started_at),
            end: moment(data.events[i].ended_at),
            url: data.events.event_url,
            description: ""
                         + "day:" + moment(data.events[i].started_at).format("MM/DD HH:mm") + " - "
                         + "" + moment(data.events[i].ended_at).format("MM/DD HH:mm") + "<br>"
                         + "limit:" + data.events[i].limit + "<br>"
                         + "place:" + data.events[i].place + "<br>"
                         + "address:" + data.events[i].address + "<br>"
                         + "description:" + data.events[i].catch.substring(0,49) + "<br>"
                         + "",

            backgroundColor: '#a82400',
            borderColor: '#a82400',
            textColor: 'white'
          });
        }
        return event;
      }

      const atnd = data => {
        let event = [];
        for (var i in data.events) {
          event.push({
            title: data.events[i].event.title,
            start: moment(data.events[i].event.started_at),
            end: moment(data.events[i].event.ended_at),
            url: data.events[i].event.event_url,
            description: ""
                         + "day:" + moment(data.events[i].event.started_at).format("MM/DD HH:mm") + " - "
                         + "" + moment(data.events[i].event.ended_at).format("MM/DD HH:mm") + "<br>"
                         + "limit:" + data.events[i].event.limit + "<br>"
                         + "place:" + data.events[i].event.place + "<br>"
                         + "address:" + data.events[i].event.address + "<br>"
                         + "description:" + data.events[i].event.description.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'').substring(0,49) + "<br>"
                         + "",
            backgroundColor: '#EBAC2B',
            borderColor: '#EBAC2B',
            textColor: 'white'
          });
        }
        return event;
      }

      (async () => {
        let data = [];
        let event = [];
        const progress = document.getElemntById('eventloading');
        progress.style.display = 'block';
          
        for (let i = 0; i < 10; i++) {
            data = await $.ajax({url: 'https://connpass.com/api/v1/event/?count=100&ym=' + ym + '&start=' + (i * 100 + 1), dataType: 'jsonp'});
            event = connpass(data);
            events = events.concat(event);
            progress.value = i + 1;
        }
        
        data = await $.ajax({url: 'https://api.atnd.org/events/?count=100&ym=' + ym + '&start=1&format=jsonp', dataType: 'jsonp'});          
        event = atnd(data);
        events = events.concat(event);
        progress.value = 11;          
        sessionStorage.setItem('event' + ym, JSON.stringify(events));
        progress.style.display = 'none';
        callback(events);
      })();

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
      }
    });
    
}, false);

