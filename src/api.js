const api = "http://localhost:";

module.exports = {

    linkAccount : async ( body) => {
        
        const response = await fetch( api + "/link", {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify(body)
        })
        
        return response.json();
    },
    
    getTemplateNames : async ( userId ) => {
        const response  = await fetch(`${api}/templates/${userId}`, {
            method: "GET",
            mode: "cors",
            headers: {
                'Content-Type': "application/json"
            }
        })
        
        return response.json();
    },
    
    getTemplateData: async ( userId, templateName ) => {
        const response  = await fetch(`${api}/servetemplate/${userId}/${templateName}`, {
            method: "GET",
            mode: "cors",
            headers: {
                'Content-Type': "application/json"
            }
        })
        
        return response.json();
    } 
    
    
}

