{
    let view = {
        el: 'section.songs',
        template:`
        <li>
            <h3>{{name}}</h3>
            <p>
                <svg class="icon icon-sq">
                <use xlink:href="#icon-sq"></use>
                </svg>
                {{singer}}
            </p>
            <a class="playButton" href="./song.html?id={{id}}">
                <svg class="icon icon-play">
                <use xlink:href="#icon-play"></use>
                </svg>
            </a>
        </li>
        `,
        init() {
            this.$el = $(this.el)
        },
        render(data) {
            let { songs } = data
            songs.map((song)=>{
                let $li = $(this.template
                    .replace('{{name}}', song.name)
                    .replace('{{singer}}', song.singer)
                    .replace('{{id}}', song.id)
                    ) 
                this.$el.find('ol.list').append($li)
            })
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
            this.view.init()
            this.model = model
            this.model.find().then(() => {
                this.view.render(this.model.data)
            })
        }
    }
    controller.init(view, model)
}