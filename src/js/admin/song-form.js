/* main */
{
    let view = {
        el: '.page > main',
        template: `
            <form class="form">
                <div class="row">
                    <label>
                        歌名
                    </label><input name="name" type="text" value="__name__">  
                </div>
                <div class="row">
                    <label>
                        歌手
                    </label><input name="singer" type="text" value="__singer__">     
                </div>
                <div class="row">
                    <label>
                        外链
                    </label><input name="url" type="text" value="__url__">  
                </div>
                <div class="row actions">
                        <button type="submit">保存</button>
                </div>
            </form>
        `,
        render(data = {}) {  // 如果没传data/或者data为undefined,则令data={}
            let html = this.template
            let placeHolder = ['name', 'singer', 'url', 'id']
            placeHolder.map((string) => {
                html = html.replace(`__${string}__`, data[string] || '')
            })
            $(this.el).html(html)
            if (data.id) {
                $(this.el).prepend('<h1>编辑歌曲</h1>')
            } else {
                $(this.el).prepend('<h1>新建歌曲</h1>')
            }
        },
        reset() {
            this.render({})
        }
    }

    let model = {
        data: { name: '', singer: '', url: '', id: '' },
        created(data) {
            const Song = AV.Object.extend('Song');
            const song = new Song();
            song.set('name', data.name);
            song.set('url', data.url);
            song.set('singer', data.singer);
            return song.save().then((newSong) => {
                let { id, attributes } = newSong
                Object.assign(this.data, {  // 更新model的data
                    id,
                    ...attributes    // attributes: {name: "123", url: "333", singer: "33"}
                })
            }, (error) => {
                console.log(error)
            });
        },
        update(data) {
            const song = AV.Object.createWithoutData('Song', data.id)
            song.set('name', data.name)
            song.set('singer', data.singer)
            song.set('url', data.url)
            return song.save().then((response) => {
                Object.assign(this.data, data)
                return response
            })
        }
    }

    let controller = {
        init(view, model) {
            this.view = view
            this.model = model
            this.view.render(this.model.data)
            this.bindEvent()
        },
        bindEvent() {
            $(this.view.el).on('submit', 'form', (e) => {
                e.preventDefault()
                let name = $(this.view.el).find('input[name=name]').val()
                let singer = $(this.view.el).find('input[name=singer]').val()
                let url = $(this.view.el).find('input[name=url]').val()
                let id = this.model.data.id
                if (id) {
                    this.model.update({ name: name, url: url, singer: singer, id: id})
                        .then(()=>{
                            window.eventHub.emit('update', JSON.parse(JSON.stringify(this.model.data)))
                        })
                } else {
                    this.model.created({ name: name, url: url, singer: singer })
                        .then(() => {
                            this.view.reset()
                            window.eventHub.emit('created', JSON.parse(JSON.stringify(this.model.data)))
                        })
                }

            })
            window.eventHub.on('new', (data) => {
                if (data) {
                    this.view.render(data)
                } else {
                    this.model.data = { id: '', singer: '', name: '', url: '' }
                    this.view.render(this.model.data)
                }
            })
            window.eventHub.on('select', (data) => {
                Object.assign(this.model.data, data)
                this.view.render(data)
            })
        }
    }

    controller.init(view, model)
}