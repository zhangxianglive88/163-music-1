{
    let view = {
        el: '#app',
        render(data) {
            let {song} = data
            $(this.el).css('background-image', `url(${song.cover})`) 
            $(this.el).find('img.cover').attr('src', song.cover)
            $(this.el).find('audio').attr('src', song.url)
            $(this.el).find('.song-description > h1').text(song.singer)
            let regex = /\[([\d:.]+)\](.+)/  
            console.log(song.lyric) 
            song.lyric.split('\n').map((string)=>{  
                let p = document.createElement('p')
                let matches = string.match(regex)
                let parts
                if(matches){
                    p.textContent = matches[2]
                    parts = matches[1].split(':')
                }else{
                    parts = string.substring(1, string.length-1).split(':')
                    p.textContent = ''
                }
                let second = parseInt(parts[0]) * 60 + parseFloat(parts[1])  // [02:12.05]愿我在一贫如洗能有你在身旁。
                p.setAttribute('lyric-time', second)
                $(this.el).find('.lyric > .lines').append(p)
            })
        },
        showLyric(time){ // 显示某个时间点的歌词
            let allP = $(this.el).find('.lyric>.lines>p')
            let p
            for(let i = 0; i < allP.length; i++){
                if(i === allP.length-1){
                    p = allP[i]
                }else{
                    let currentTime = allP.eq(i).attr('lyric-time')
                    let nextTime = allP.eq(i+1).attr('lyric-time')
                    if(currentTime <= time && time < nextTime){
                        p = allP[i]
                        break
                    }
                }
            }
            let pHeight = p.getBoundingClientRect().top
            let linesHeight = $(this.el).find('.lyric>.lines')[0].getBoundingClientRect().top
            let height = pHeight - linesHeight
            $(this.el).find('.lyric>.lines').css({
                transform: `translateY(${-(height - 20)}px)`
            })
            $(p).addClass('active').siblings('.active').removeClass('active')
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
            $(this.view.el).find('audio').on('ended', ()=>{
                this.view.pause()
                this.model.data.status = 'paused'
                $(this.view.el).find('.disc-container').removeClass('playing')
            })
            $(this.view.el).find('audio').on('timeupdate', ()=>{
                let time = $(this.view.el).find('audio')[0].currentTime + 0.55
                this.view.showLyric(time)
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