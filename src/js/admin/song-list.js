{
    let view = {
        el: '#songList-container',
        template: `
            <ul class="songList">
            </ul>
        `,
        render(data) {
            let { songs, selectedId } = data
            console.log(selectedId)
            $(this.el).html(this.template)
            $(this.el).find('ul').empty()
            songs.map((song) => {
                let $li = $('<li></li>').text(song.name).attr("data-song-id", song.id)
                if(selectedId === song.id){
                    $li = $li.addClass('active')
                }
                $(this.el).find('ul').append($li)
            })
        },
        clearActive() {
            $(this.el).find('.active').removeClass('active')
        }
    }

    let model = {
        data: {
            songs: [],
            selectedId:undefined
        },
        find() {
            const query = new AV.Query('Song')
            return query.find().then((songs) => {
                console.log(songs)
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
                let songId = e.currentTarget.getAttribute('data-song-id')
                this.model.data.selectedId = songId
                this.view.render(this.model.data)
                let data
                let songs = this.model.data.songs
                for(let i = 0; i < songs.length; i++){
                    if(songs[i].id === songId){
                        data = songs[i]
                        break
                    }
                }
                window.eventHub.emit('select', JSON.parse(JSON.stringify(data)))
            })
        },
        getAllSongs() {
            this.model.find().then(() => {
                this.view.render(this.model.data)
            })
        },
        bindEventHub() {
            window.eventHub.on('new', () => {
                this.view.clearActive()
            })
            window.eventHub.on('created', (newSong) => {
                let song = JSON.parse(JSON.stringify(newSong)) // 深拷贝，不能传引用
                this.model.data.songs.push(song)
                this.view.render(this.model.data)
            })
            window.eventHub.on('update', (song)=>{
                let songs = this.model.data.songs
                for(let i = 0; i < songs.length; i++){
                    if(songs[i].id === song.id){
                        Object.assign(songs[i], song) // 不丢失之前的对象
                    }
                }
                this.view.render(this.model.data)
            })
        }
    }

    controller.init(view, model)
}