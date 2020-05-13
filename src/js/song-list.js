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
                let domLi = $('<li></li>').text(song.name)
                $(this.el).find('ul').append(domLi)
            })
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
            return query.find().then((songs)=>{
                this.data.songs = songs.map((song)=>{
                    return {id:song.id, ...song.attributes}
                })
                console.log(this.data.songs)
                return songs
            })
        }
    }

    let controller = {
        init(view, model) {
            this.view = view
            this.model = model
            this.view.render(this.model.data)
            window.eventHub.on('upload', () => {
                this.view.clearActive()
            })
            window.eventHub.on('created', (newSong) => {
                let song = JSON.parse(JSON.stringify(newSong)) // 深拷贝，不能传引用
                this.model.data.songs.push(song)
                this.view.render(this.model.data)
            })
            this.model.find().then(()=>{
                this.view.render(this.model.data)
            })
        },
    }

    controller.init(view, model)
}