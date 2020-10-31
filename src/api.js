
import axios from "axios";

export default function (subRouteName, resourceIds = {}, args = {}) {

    // Map crud operation from subresource name to http verb
    let op = _.last(_.split(subRouteName, '.'));
    let httpVerb = ({
        'create': 'post',
        'bulk-create': 'post',
        'retrieve': 'get',
        'retrieve-all': 'get',
        'update': 'patch',
        'delete': 'delete'
    })[op];

    // Add implied user root resource to call
    let fullResourceName = 'api.users.' + subRouteName;
    resourceIds.user = window.MSYS.LOGGED_IN_USER_ID;


    let axiosConfig = {
        method: httpVerb,
        url: window.route(fullResourceName, resourceIds).url()
    };
    if (httpVerb === 'post' || httpVerb === 'patch') {
        axiosConfig.data = args;
    }

    console.log("executing axios request (conf, cookie)", axiosConfig, document.cookie);

    return axios(axiosConfig)
        .then(result => {
            console.log("user api returned result", result);
            return result;
        });
}
