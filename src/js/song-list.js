{
    let view = {
        el: '#songList-container',
        template: `
            <ul class="songList">
            </ul>
        `,
        render(data) {
            let { songs } = data
            $(this.el).html(this.template)
            $(this.el).find('ul').empty()
            songs.map((song) => {
                let domLi = $('<li></li>').text(song.name).attr("data-song-id", song.id)
                $(this.el).find('ul').append(domLi)
            })
        },
        activeItem(li) {
            let $li = $(li)
            $li.addClass('active')
                .siblings('.active').removeClass('active')
        },
        clearActive() {
            $(this.el).find('.active').removeClass('active')
        }
    }

    let model = {
        data: {
            songs: []
        },
        find() {
            const query = new AV.Query('Song')
            return query.find().then((songs) => {
                this.data.songs = songs.map((song) => {
                    return { id: song.id, ...song.attributes }
                })
                return songs
            })
        }
    }

    let controller = {
        init(view, model) {
            this.view = view
            this.model = model
            this.bindEvent()
            this.view.render(this.model.data)
            this.getAllSongs()
            this.bindEventHub()
        },
        bindEvent() {
            $(this.view.el).on('click', "li", (e) => {
                let li = e.currentTarget
                this.view.activeItem(li)
                let songId = e.currentTarget.getAttribute('data-song-id')
                let data
                let songs = this.model.data.songs
                for(let i = 0; i < songs.length; i++){
                    if(songs[i].id === songId){
                        data = songs[i]
                        break
                    }
                }
                window.eventHub.emit('clickItem', JSON.parse(JSON.stringify(data)))
            })
        },
        getAllSongs() {
            this.model.find().then(() => {
                this.view.render(this.model.data)
            })
        },
        bindEventHub() {
            window.eventHub.on('upload', () => {
                this.view.clearActive()
            })
            window.eventHub.on('created', (newSong) => {
                let song = JSON.parse(JSON.stringify(newSong)) // 深拷贝，不能传引用
                this.model.data.songs.push(song)
                this.view.render(this.model.data)
            })
            window.eventHub.on('new', ()=>{
                this.view.clearActive()
            })
        }
    }

    controller.init(view, model)
}