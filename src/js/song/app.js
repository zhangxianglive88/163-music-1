{
    let view = {
        el: '#app',
        template:`
            <audio> 
                <source src={{url}}>
            </audio>
            <div>
                <button class="play">播放</button>
                <button class="pause">暂停</button>
            </div>
        `,
        render(data){
            $(this.el).html(this.template.replace('{{url}}', data.url))
        },
        play(){
            $(this.el).find('audio')[0].play()
        },
        pause(){
            $(this.el).find('audio')[0].pause()
        }
    }
    let model = {
        data: {
            id: '',
            name: '',
            singer: '',
            url: ''
        },
        setId(id) {
            this.data.id = id
        },
        get(id) {
            const query = new AV.Query('Song');
            return query.get(id).then((song) => {
                Object.assign(this.data, song.attributes)
                return song
            })
        }
    }
    let controller = {
        init(view, model) {
            this.view = view
            this.model = model
            let id = this.getSongId()
            this.model.setId(id)
            this.model.get(id).then(()=>{
                this.view.render(this.model.data)
            })
            this.bindEvent()
        },
        bindEvent(){
            $(this.view.el).on('click', '.play', ()=>{
                this.view.play()
            })
            $(this.view.el).on('click', '.pause', ()=>{
                this.view.pause()
            })
        },
        getSongId() {
            let search = window.location.search  // 获取查询参数
            if (search.indexOf('?') === 0) {
                search = search.substring(1)
            }
            let id = ''
            let array = search.split('&').filter((v => v)) // 过滤掉数组中的空字符串 ['a=1', '', 'b=2']
            for (let i = 0; i < array.length; i++) {
                let kv = array[i].split('=')
                let key = kv[0]
                let value = kv[1]
                if (key === 'id') {
                    id = value
                    break
                }
            }
            return id
        }
    }
    controller.init(view, model)
}




