
import {ref,computed} from "vue";

export function useVirtualScroll<T>(
  items:()=>T[],
  options:{
    itemHeight:number;
    buffer:number;
  }
){
  const {itemHeight,buffer=3}=options;
  const scrollTop=ref(0);
  const containerHeight=ref(0);
  const visibleRange = computed(()=>{
    const startIndex=Math.floor(scrollTop.value/itemHeight);


    const endIndex=Math.floor((scrollTop.value+containerHeight.value)/itemHeight);


    const result={
      start: Math.max(0, startIndex - buffer),
      end: Math.min(items().length, endIndex + buffer)
    }
    return result;   
  });

  const visibleItems = computed(()=>{
    const {start,end}=visibleRange.value;
    return items().slice(start,end)
    .map((item,index)=>({
      ...item,
      actualIndex:start+index
    }));
  });

  const totalHeight = computed(()=>{
    return items().length * itemHeight;
  });

  const offsetY = computed(()=>{
    Math.max(0,visibleRange.value.start*itemHeight)
  });


  const handleScroll = (scrollElment:HTMLElement)=>{
    scrollTop.value = scrollElment.scrollTop;
    containerHeight.value=scrollElment.clientHeight;
  };

  const initContainerHeight = (scrollElement:HTMLElement)=>{
    containerHeight.value=scrollElement.clientHeight;
  };

    return {
    visibleItems,    // 可见的items
    totalHeight,    // 总高度
    offsetY,        // 偏移量
    handleScroll,   // 滚动处理函数
    initContainerHeight  // 初始化容器高度
  };
}