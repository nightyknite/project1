document.addEventListener("DOMContentLoaded", function(){
    
    const setCalendar = (start, end, callback) => {
      let events = [];
      let dt = new Date(start);
      
      dt.setDate(dt.getDate() + 7);

      const ym = dt.getFullYear() + ("00" + (dt.getMonth()+1)).slice(-2);
      const item = sessionStorage.getItem('event' + ym);
      
      if (item !== null) {
        events = JSON.parse(item);

        const keyword = document.getElementById("keyword");
        if ((keyword !== null) && (keyword.value.length > 0)) {
          events = events.filter(event => {return (event.description.indexOf(keyword.value) > 0);});
        }
        callback(events);
        return;
      }
      
      const connpass = data => {
        let event = [];
        for (var i in data.events) {
          event.push({
            title: data.events[i].title,
            start: data.events[i].started_at,
            end: data.events[i].ended_at,
            url: data.events[i].event_url,
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
            start: data.events[i].event.started_at,
            end: data.events[i].event.ended_at,
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


      const doorkeeper = data => {
        let event = [];
        for (let i in data) {
          event.push({
            title: data[i].event.title,
            start: data[i].event.starts_at,
            end: data[i].event.ends_at,
            url: data[i].event.public_url,
            description: ""
                         + "day:" + moment(data[i].event.starts_at).format("MM/DD HH:mm") + " - "
                         + "" + moment(data[i].event.ends_at).format("MM/DD HH:mm") + "<br>"
                         + "limit:" + data[i].event.ticket_limit + "<br>"
                         + "place:" + data[i].event.venue_name + "<br>"
                         + "address:" + data[i].event.address + "<br>"
                         + "description:" + data[i].event.description.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'').substring(0,49) + "<br>"
                         + "",
            backgroundColor: '#0F4FF4',
            borderColor: '#EBAC2B',
            textColor: 'white'
          });
        }
        return event;
      }

      (async () => {
        let data = [];
        let event = [];
        const results = [];

        const progress = document.getElementById('eventloading');
        progress.max = 15;
        progress.style.display = 'block';
        progress.value = 0;
        
        results.push((async () => {
          for (let i = 0; i < 10; i++) {
            data = await $.ajax({url: 'https://connpass.com/api/v1/event/?count=100&ym=' + ym + '&start=' + (i * 100 + 1), dataType: 'jsonp'});
            event = connpass(data);
            events = events.concat(event);
            progress.value = progress.value + 1;
          }
        })());

        results.push((async () => {
          for (let i = 0; i < 4; i++) {
            data = await $.ajax({url: 'https://api.atnd.org/events/?count=100&ym=' + ym + '&start='+ (i * 100 + 1) + '&format=jsonp', dataType: 'jsonp'});          
            event = atnd(data);
            events = events.concat(event);
            progress.value = progress.value + 1;
          }
        })());
        
        results.push((async () => {
          let doorkeeperToken = sessionStorage.getItem('doorkeeperToken') || localStorage.getItem('doorkeeperToken');
          if (doorkeeperToken !== null) {
            for (let i = 1; i < 20; i++) {
              data = await $.ajax({url: 'https://api.doorkeeper.jp/events?since=' + moment(start).add(7, 'days').startOf('month').toISOString() + '&until=' + moment(start).add(7, 'days').endOf('month').toISOString() + '&sort=starts_at&page=' + i, dataType: 'jsonp', headers: { 'Authorization': 'Bearer ' +  doorkeeperToken} });     
              event = doorkeeper(data);
              events = events.concat(event);
              progress.value = progress.value + 1;
            }
          }
        })());

        await Promise.all(results);
        
        sessionStorage.setItem('event' + ym, JSON.stringify(events));
        progress.style.display = 'none';
        callback(events);

      })();

    }

    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
      plugins: [ 'dayGrid', 'list' ],
      defaultView: 'dayGridMonth',
      views: {
        listDay: { buttonText: '日' },
        listWeek: { buttonText: '週' }
      },
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,listWeek,listDay'
      },
      locale: 'ja',
      events: (info, successCallback, failureCallback) => setCalendar(info.startStr, info.endStr, successCallback),
      eventRender: (info) => {
        $(info.el).popover({
          title: info.event.title,
          content: info.event.extendedProps.description,
          trigger: 'hover',
          html: true,
          placement: 'top',
          container: 'body'
        });
      },
      eventClick: function(info) {
        info.jsEvent.preventDefault();
        if (info.event.url) {
          window.open(info.event.url);
        }
      }
    });

    calendar.render();

    document.getElementById("search").addEventListener('click', ()=> {
      calendar.refetchEvents();
      calendar.render();
    });
    
});

