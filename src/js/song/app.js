{
    let view = {
        el: '#app',
        render(data) {
            let {song, status} = data
            $(this.el).css('background-image', `url(${song.cover})`)
            $(this.el).find('img.cover').attr('src', song.cover)
            $(this.el).find('audio').attr('src', song.url)
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
            song: {
                id: '',
                name: '',
                singer: '',
                url: ''
            },
            status: 'paused'
        },
        get(id) {
            const query = new AV.Query('Song');
            return query.get(id).then((song) => {
                Object.assign(this.data.song, song.attributes)
                return song
            })
        }
    }
    let controller = {
        init(view, model) {
            this.view = view
            this.model = model
            let id = this.getSongId()
            this.model.get(id).then(() => {
                this.view.render(this.model.data)
                // this.view.play()
            })
            this.bindEvent()
        },
        bindEvent() {
            $(this.view.el).on('click', '.icon-wrapper', ()=>{
                let status = this.model.data.status
                if(status === 'playing'){
                    $(this.view.el).find('.disc-container').removeClass('playing')
                    this.model.data.status = 'paused'
                    this.view.pause()
                }else{
                    $(this.view.el).find('.disc-container').addClass('playing')
                    this.model.data.status = 'playing'
                    this.view.play()
                }
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




