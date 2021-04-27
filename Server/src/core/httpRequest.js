const axios = require("axios");

const createConv = async () => {

    let request = {
        method : "post",
        url : "http://conversation/api/conversations/",
        headers : { }
    }

    try{
        let response =  await axios(request);

        return {
            status : response.status,
            data : response.data
        };

    } catch (e){
        console.log(e.response);

        return {
            status : e.response.status,
            data : e.response.data
        }
    }
};

exports.createConv = createConv;