const express = require('express');
//sửa require của postModel (require('../models/post.model') -> require('../Models/post.model'))
const postModel = require('../Models/post.model');
const tagModel = require('../Models/tag.model');
const moment = require('moment');
const config = require('../config/default.json');

const router = express.Router();


// function complete text
function completeTextTitle(listPost, endTitle)
{
    var tmpTitle = listPost[i].Title;
    listPost[i].Title = listPost[i].Title.substring(0, endTitle);
    for(k = endTitle; k < endTitle + 10; k++)
    {
        if(tmpTitle.charAt(k) != ' ')
        {
            listPost[i].Title = listPost[i].Title + tmpTitle.charAt(k);
        }
        else
        {
            break;
        }
    }
    listPost[i].Title = listPost[i].Title + "...";
}
// function complete summary
function completeTextSummary(listPost, end)
{
    var tmpSummary= listPost[i].Content_Summary;
    listPost[i].Content_Summary = listPost[i].Content_Summary.substring(0, end);
    for(k = end; k < end + 5; k++)
    {
        if(tmpSummary.charAt(k) != ' ')
        {
            listPost[i].Content_Summary = listPost[i].Content_Summary + tmpSummary.charAt(k);
        }
        else
        {
            break;
        }
    }
    listPost[i].Content_Summary = listPost[i].Content_Summary + "...";
}
// function shorten of post
function shortenText(listPost, end, endTitle)
{
    for(i = 0; i < listPost.length; i++)
    {
        if(listPost[i].Content_Summary.length > end)
        {
            completeTextSummary(listPost, end);
        }
    }

    for(i = 1; i < listPost.length; i++)
    {
        if(listPost[i].Title.length > endTitle)
        {
            completeTextTitle(listPost, endTitle);
        }
    }
}
// function shorten title
function shortenTitle(listPost, end)
{
    for(i = 0; i < listPost.length; i++)
    {
        if(listPost[i].Title.length > end)
        {
            completeTextTitle(listPost, end);
        }
    }
}

// Trang index
router.get('/',async function (req, res) {
    const listTag = await tagModel.all();
    const listRandomSidebar = await postModel.postRandomSideBar();
    const listFutureEvent = await postModel.furuteEvents();

     // shorten randomPost, futureEvent
     const end_Random = 20;
     const end_FutureEvent = 35;
 
     // random
     shortenTitle(listRandomSidebar, end_Random);
     // futureEvent
     shortenTitle(listFutureEvent, end_FutureEvent);



    for(let i = 0; i < listRandomSidebar.length; i++)
    {
        listRandomSidebar[i].DatetimePost = moment(listRandomSidebar[i].DatetimePost, 'DD/MM/YYYY').format('DD/MM');
    }
    for(let i = 0; i < listFutureEvent.length; i++)
    {
        listFutureEvent[i].DatetimePost = moment(listFutureEvent[i].DatetimePost, 'DD/MM/YYYY').format('DD/MM');
    }
    res.render('vwTag/listTag', {
        layout: 'listCategoryTag',
        listTag,
        emptyTag: listTag.length === 0,
        listRandomSidebar,
        listFutureEvent,
        emptyFutureEvent: listFutureEvent.length === 0,
        helpers: {
            loadListRandomSideBar_1: function(context, options)
            {
                let ret = "";
                for(let i = 0; i < 4; i++)
                {
                    ret = ret + options.fn(context[i]);
                }
                return ret;
            }
            ,
            loadListRandomSideBar_2: function(context, options)
            {
                let ret = "";
                for(let i = 4; i < 8; i++)
                {
                    ret = ret + options.fn(context[i]);
                }
                return ret;
            }
            ,
            loadListRandomSideBar_3: function(context, options)
            {
                let ret = "";
                for(let i = 8; i < 12; i++)
                {
                    ret = ret + options.fn(context[i]);
                }
                return ret;
            },
            convertMonth: function(value)
            {
                     if(value == 1) return "Jan";
                else if(value == 2) return "Feb";
                else if(value == 3) return "Mar";
                else if(value == 4) return "Apr";
                else if(value == 5) return "May";
                else if(value == 6) return "Jun";
                else if(value == 7) return "Jul";
                else if(value == 8) return "Aug";
                else if(value == 9) return "Sep";
                else if(value == 10) return "Oct";
                else if(value == 11) return "Nov";
                else if(value == 12) return "Dec";
                else return "?";
            }
        }
    })
}) 

router.get('/:TagName',async function(req, res){
    
    const ValueSearch = req.params.TagName;
    const page = +req.query.page || 1;
    const offset = (page - 1) * config.pagination.limitPostPage;



    const [listPost, Total] = await Promise.all([postModel.postByTag(config.pagination.limitPostPage, offset, ValueSearch), postModel.CountPostByTag(ValueSearch)]);
    const nPages = Math.ceil(Total[0].Number / config.pagination.limitPostPage);

    const page_items = [];
    let count = 0;
    let lengthPagination = 0;
    let temp = page;
    

    while (true) {
        if (temp - config.pagination.limitPaginationLinks > 0) {
            count++;
            temp = temp - config.pagination.limitPaginationLinks;
        }
        else {
            break;
        }
    }
    if ((count * config.pagination.limitPaginationLinks) + config.pagination.limitPaginationLinks >= nPages) {
        lengthPagination = nPages;
    }
    else {
        lengthPagination = (count * config.pagination.limitPaginationLinks) + config.pagination.limitPaginationLinks;
    }
    for (let i = (count * config.pagination.limitPaginationLinks) + 1; i <= lengthPagination; i++) {
        const item = {
            value: i,
            isActive: i === page,
        }
        page_items.push(item);
    }






    const listPostTags = await postModel.postTags();
    const listRandomSidebar = await postModel.postRandomSideBar();
    const listFutureEvent = await postModel.furuteEvents();


     // shorten context summary, title
     const end_Cotent_Summary = 110;
     const end_Title = 65;
     shortenText(listPost, end_Cotent_Summary, end_Title);
 
 
     // shorten randomPost, futureEvent
     const end_Random = 20;
     const end_FutureEvent = 35;
 
     // random
     shortenTitle(listRandomSidebar, end_Random);
     // futureEvent
     shortenTitle(listFutureEvent, end_FutureEvent);


    for(let i = 0; i < listRandomSidebar.length; i++)
    {
        listRandomSidebar[i].DatetimePost = moment(listRandomSidebar[i].DatetimePost, 'DD/MM/YYYY').format('DD/MM');
    }
    for(let i = 0; i < listFutureEvent.length; i++)
    {
        listFutureEvent[i].DatetimePost = moment(listFutureEvent[i].DatetimePost, 'DD/MM/YYYY').format('DD/MM');
    }

    for(let i = 0; i < listPost.length; i++)
    {
        listPost[i].DatetimePost = moment(listPost[i].DatetimePost, 'DD/MM/YYYY').format('DD/MM/YYYY, HH:mm');
    }
    
    res.render('vwTag/postByTag', {
        layout: 'listCategoryTag',
        listPost,
        emptyPost: listPost.length === 0,
        listPostTags,
        listRandomSidebar,
        listFutureEvent,
        helpers:{
            load_list_tags: function(context, Id, options)
            {
                let ret = "";
                let count = 0;
                for(let i = 0; i < context.length; i++)
                {
                    //console.log(context[i].Id);
                    //console.log(context[i]);
                    if(context[i].IdPost === Id && count < 3)
                    {
                        ret = ret + options.fn(context[i]);
                        count++;
                    }
                }
                return ret;
            },
            loadListRandomSideBar_1: function(context, options)
            {
                let ret = "";
                for(let i = 0; i < 4; i++)
                {
                    ret = ret + options.fn(context[i]);
                }
                return ret;
            }
            ,
            loadListRandomSideBar_2: function(context, options)
            {
                let ret = "";
                for(let i = 4; i < 8; i++)
                {
                    ret = ret + options.fn(context[i]);
                }
                return ret;
            }
            ,
            loadListRandomSideBar_3: function(context, options)
            {
                let ret = "";
                for(let i = 8; i < 12; i++)
                {
                    ret = ret + options.fn(context[i]);
                }
                return ret;
            },
            convertMonth: function(value)
            {
                     if(value == 1) return "Jan";
                else if(value == 2) return "Feb";
                else if(value == 3) return "Mar";
                else if(value == 4) return "Apr";
                else if(value == 5) return "May";
                else if(value == 6) return "Jun";
                else if(value == 7) return "Jul";
                else if(value == 8) return "Aug";
                else if(value == 9) return "Sep";
                else if(value == 10) return "Oct";
                else if(value == 11) return "Nov";
                else if(value == 12) return "Dec";
                else return "?";
            }
        },
        page_items,
        prev_value: page - 1,
        next_value: page + 1,
        can_go_prev: page > 1,
        can_go_next: page < nPages,
        last: nPages,
        SearchNotEmpty:ValueSearch.length !== 0,
        TagName:ValueSearch,
    })
});


module.exports = router;

