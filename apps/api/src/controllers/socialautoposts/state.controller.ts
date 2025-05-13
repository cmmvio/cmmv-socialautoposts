import {
    Controller
} from "@cmmv/http";

import {
    StateControllerGenerated
} from "@generated/controllers/socialautoposts/state.controller"; 

@Controller('state')
export class StateController extends StateControllerGenerated {}