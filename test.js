gantt.config.columns = [
  { name: "text",       label: "Task name",  width: "*", tree: true },
  { name: "start_date", align: "center", width: 100, resize: true },
  { name: "end_date",label:"End Time", align: "center", width: 100, resize: true },
  {
    name: "owner", align: "center", width: 75, label: "Owner", template: function(task) {
     // console.log(gantt.getTaskAssignments(task.id)[0].resource_id);
     if(gantt.getTaskAssignments(task.id)[0] && task.type == "assignment"){
      return resourcesStore.getItem((gantt.getTaskAssignments(task.id)[0]).resource_id).label;
     }
    return "Unassigned";

    } },
  { name: "allocation",label:"Allocation", align: "center", width: 100, resize: true },
  { name: "add", width: 44 }
];
gantt.config.layout = {
  css: "gantt_container",
  rows:[
      {
         cols: [
          {
            // the default grid view  
            view: "grid",  
            scrollX:"scrollHor", 
            scrollY:"scrollVer"
          },
          { resizer: true, width: 1 },
          {
            // the default timeline view
            view: "timeline", 
            scrollX:"scrollHor", 
            scrollY:"scrollVer"
          },
          {
            view: "scrollbar", 
            id:"scrollVer"
          }
      ]},
      {
          view: "scrollbar", 
          id:"scrollHor"
      }
  ]
}
/***************************************************RESOURCE************************************************************ */
var resourcesStore = gantt.createDatastore({
  name: gantt.config.resource_store,
});

function getOwnerOptions() {
  return [
    { key: 1, label: "Anton" },
    { key: 2, label: "Mike" },
    { key: 3, label: "Poilina" }
  ];
}


/******************************************settings***************************************************************** */
gantt.config.resources = true;
gantt.config.resource_store = "resource";
gantt.config.resource_property = "owner";
gantt.config.order_branch = true;
	gantt.config.open_tree_initially = true;
  gantt.locale.labels.section_owner ="Owners";
  gantt.locale.labels.type_project = "Project";
gantt.locale.labels.type_phase = "Phase";
gantt.locale.labels.type_assignment = "Assignment";
gantt.locale.labels.type_task = "Task";
gantt.locale.labels.type_baseline= "baseline";

gantt.config.types = {
  project: "project",
  phase: "phase",
  task: "task",
  assignment: "assignment",
  baseline: "baseline",
}

gantt.config.task_types = {
  project: ["phase", "task", "assignment"],
  phase: ["task", "assignment"],
  task: ["assignment"],
  assignment: ["baseline"],
};




/*********************************************************MOVEMENT**************************************************** */


gantt.attachEvent("onAfterTaskAdd",function(id,task){
  console.log(gantt.getTaskAssignments(task.id));
  if(task.type == "assignment" && gantt.getParent(id) != 0){
    let children = gantt.getChildren(gantt.getParent(id));
 
    let start_date = gantt.getTask(children[0]).start_date;
    let end_date = gantt.getTask(children[0]).end_date;

    gantt.eachTask(function(child){
        if(+(start_date) > +(child.start_date)){
          start_date = child.start_date
        }
        else if (+(end_date)< +(child.end_date)){
          end_date = child.end_date;
        }
    }, gantt.getParent(id));
    gantt.getTask(gantt.getParent(id)).start_date = start_date;
    gantt.getTask(gantt.getParent(id)).end_date = end_date;
    gantt.updateTask(gantt.getParent(id));
  }
});
gantt.attachEvent("onTaskDrag", function(id, mode, task, original){
  var state = gantt.getState();
  var modes = gantt.config.drag_mode;
  var diff = task.start_date - original.start_date;
  /*if ((task.type == "assignment" || task.type == "baseline") && mode == modes.resize){

  }*/
  if (gantt.getParent(task.id) != 0){
  var children = gantt.getChildren(gantt.getParent(id));
 
    var start_date = gantt.getTask(children[0]).start_date;
    var end_date = gantt.getTask(children[0]).end_date;

    gantt.eachTask(function(child){
        if(+(start_date) > +(child.start_date)){
          start_date = child.start_date
        }
        else if (+(end_date)< +(child.end_date)){
          end_date = child.end_date;
        }
    }, gantt.getParent(id));
  }
  if (gantt.getParent(task.id) != 0 && task.type == "assignment"){
    let parent_task = gantt.getTask(task.parent);
    if(mode == modes.resize){
      if(task.start_date <= start_date){
          parent_task.start_date = task.start_date;
          gantt.updateTask(parent_task.id);

      }
    }
  }
  else if(mode == modes.move && task.type != "assignment"){
 
      gantt.eachTask(function(child){
          child.start_date = new Date(+child.start_date + diff);
          child.end_date = new Date(+child.end_date + diff);
          gantt.updateTask(child.id);
      },id );
  }
  if(mode == modes.move && task.type == "assignment"){
   
   
    if(gantt.getTask(gantt.getParent(id)).end_date < end_date){
      gantt.getTask(gantt.getParent(id)).end_date = end_date;
      gantt.getTask(gantt.getParent(id)).start_date = start_date;
      gantt.updateTask(gantt.getParent(id));
    }
    else if(gantt.getTask(gantt.getParent(id)).end_date >= end_date)
    gantt.getTask(gantt.getParent(id)).end_date = end_date;
    gantt.getTask(gantt.getParent(id)).start_date = start_date;
    gantt.updateTask(gantt.getParent(id));
  }
});

gantt.attachEvent("onAfterTaskDrag", function(id, mode, e){
  var modes = gantt.config.drag_mode;
  var state = gantt.getState();
  if((mode == modes.move ||  mode == modes.resize)  && gantt.getParent(id)){
    let parent = gantt.getTask(gantt.getParent(id));
    parent.start_date = gantt.roundDate({
      date:parent.start_date, 
      unit:state.scale_unit, 
      step:state.scale_step
  });
  parent.end_date = gantt.calculateEndDate(parent.start_date, 
    parent.duration, gantt.config.duration_unit);
  gantt.updateTask(parent.id);
  }
  if(mode == modes.move ){
      gantt.eachTask(function(child){          
          child.start_date = gantt.roundDate({
              date:child.start_date, 
              unit:state.scale_unit, 
              step:state.scale_step
          });         
          child.end_date = gantt.calculateEndDate(child.start_date, 
              child.duration, gantt.config.duration_unit);
          gantt.updateTask(child.id);
      },id );
  }
});
gantt.attachEvent("onLightboxSave", function(id, task, is_new){
  gantt.updateTask(id);
  if(task.parent != 0){
    if(!(gantt.config.task_types[gantt.getTask(task.parent).type]).includes(task.type)){
        return false;
    }
  }
  return true;
})


/********************************************************SECTIONS********************************************************** */


gantt.config.lightbox.sections = [
  {name: "description", height: 70, map_to: "text", type: "textarea", focus: true},
  {name: "type", type: "typeselect", map_to: "type"},
  {name: "time", type: "duration", map_to: "auto"}, 
  {name: "owner", type: "resources",map_to:"auto", options: getOwnerOptions()}

];
gantt.config.lightbox.assignment_sections= [
  {name: "description", height: 70, map_to: "text", type: "textarea", focus: true},
  {name: "time", type: "duration", map_to: "auto"},
  {name:"allocation", height:22, map_to:"allocation", type:"select", options: [ 
    {key:"QA", label: "QA"},                                               
    {key:"Developer", label: "Developer"},                                             
    {key:"Other", label: "Other"}                                                 
 ]},   
  {name: "owner_assignment",type: "resources",map_to: "auto", options: getOwnerOptions()}
];


/********************************************STYLE********************************************************* */
gantt.templates.task_text = function(start, end, task){

  if (task.type != "assignment"){ 
    if((gantt.getTaskAssignments(task.id)[0])){
    return task.type + ", owner: " + resourcesStore.getItem(((gantt.getTaskAssignments(task.id)[0]).resource_id)).label ;
    }
    else{ 
      return task.type;}
    }
  return "";
   //return task.type;
}
gantt.templates.task_class = function(start, end, task){
      if (task.type == "baseline"){
        return "baseline"
      }
  }
gantt.templates.scale_row_class = function(scale){           
    return "updColor";
}



/**************************************************BLOCK LINK***************************************** */ 
  gantt.attachEvent("onBeforeLinkAdd", function(id, link){
    const source = gantt.getTask(link.source);
    const target = gantt.getTask(link.target);
    
    // Block dependencies involving assignments
    if(source.type === "assignment" || target.type === "assignment") {
      return false;
    }
    return true;
  });


gantt.init("gantt_here");

resourcesStore.parse([// resources
  { id: 1, label: "Anton" },
    { id: 2, label: "Mike" },
    { id: 3, label: "Polina"}, 
]);
var state_button = false



