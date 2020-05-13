window.eventHub = {
    events:{
        // "upload":[fn]
    },
    on(eventName, fn){  // 订阅模式
        if(this.events[eventName] === undefined){
            this.events[eventName] = []
        }
        this.events[eventName].push(fn)
    },
    emit(eventName, data){ // 分发模式
        for(let key in this.events){
            if(eventName === key){
                this.events[key].map((fn)=>{
                    fn.call(undefined, data)
                })
                break
            }
        }
    }
}