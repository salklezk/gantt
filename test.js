gantt.config.columns = [
  { name: "text",       label: "Task name",  width: "*", tree: true },
  { name: "start_date", align: "center", width: 100, resize: true },
  { name: "end_date",label:"End Time", align: "center", width: 100, resize: true },
  {
    name: "owner", align: "center", width: 75, label: "Owner", template: function(task) {
      console.log(task.owner);
      console.log(task)
      if (!task.owner || task.owner === "0") return "Unassigned";
   //   console.log(resourcesStore.getItem(task.owner[0]));
      let resource = resourcesStore.getItem(task.owner.resource_id).label;
      return resource ;
    } },
  { name: "allocation",label:"Allocation", align: "center", width: 100, resize: true },
  { name: "add", width: 44 }
];
gantt.config.resources = true;
gantt.config.resource_store = "resource";
gantt.config.resource_property = "owner";
gantt.config.order_branch = true;
	gantt.config.open_tree_initially = true;
/*var resourceGridConfig = {
  columns: [
    {
        name: "status", label: "Status", width: 60, align: "center", 
        template: function (task) {
            var progress = task.progress || 0;
            return Math.floor(progress * 100) + "";
        }
    },
    {
        name: "impact", width: 80, label: "Impact", template: function (task) {
            return (task.duration * 1000).toLocaleString("en-US", {
              style: 'currency', currency: 'USD'
          });
        }
    }
  ]
};
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
      },
      {
        // a custom layout
        cols: [
          {view: "grid", id: "resourceGrid", bind:"resource", 
              config:resourceGridConfig, scrollY:"resourceVScroll"},
          {resizer: true, width: 1},
          {view:"timeline", id:"resourceTimeline", scrollX:"scrollHor", 
              bind:"resource", 
              scrollY:"resourceVScroll"},
          {view: "scrollbar", id:"resourceVScroll"}
        ]
      },
      {view: "scrollbar", id:"scrollHor"}
  ]
}*/
/***************************************************RESOURCE************************************************************ */
var resourcesStore = gantt.createDatastore({
  name: gantt.config.resource_store,
});


/******************************************settings***************************************************************** */

//gantt.config.auto_types = true;
//gantt.config.order_branch = true;
/*********************************************************MOVEMENT**************************************************** */


gantt.attachEvent("onAfterTaskAdd",function(id,task){
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
  if (gantt.getParent(task.id) != 0 && task.type == "assignment"){
    let parent_task = gantt.getTask(task.parent);

 /* if(mode = modes.resize && +(parent_task.start_date) > +(task.start_date)){

    parent_task.start_date = gantt.roundDate({
      date:task.start_date, 
      unit:state.scale_unit, 
      step:state.scale_step});
    gantt.updateTask(task.parent);
  }
  else if(mode = modes.resize && +(parent_task.start_date) < +(task.start_date)) {
    parent_task.start_date = gantt.roundDate({
      date:task.start_date, 
      unit:state.scale_unit, 
      step:state.scale_step});
    gantt.updateTask(task.parent);
  }*/
  }
  else if(mode == modes.move && task.type != "assignment"){
 
      gantt.eachTask(function(child){
          child.start_date = new Date(+child.start_date + diff);
          child.end_date = new Date(+child.end_date + diff);
          gantt.refreshTask(child.id, true);
      },id );
  }
  if(mode == modes.move && task.type == "assignment"){
   
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
  if((mode == modes.move )  && gantt.getParent(id)){
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
gantt.locale.labels.type_project = "Project";
gantt.locale.labels.type_phase = "Phase";
gantt.locale.labels.type_assignment = "Assignment";
gantt.locale.labels.type_task = "Task";
gantt.locale.labels.type_baseline= "baseline";

function getResourceOptions() {
  return [
    { key: 1, label: "Developer" },
    { key: 2, label: "QA" },
    { key: 3, label: "PM" }
  ];
}

gantt.locale.labels.section_owner ="Owners";
/********************************************************SECTIONS********************************************************** */

gantt.form_blocks["allocation_editor"]={
  render:function(sns){ //sns - the section's configuration object
      return `<div class="form-group">+
      <label>Allocation (%):</label> 
      <input type="number" id="assignment-allocation" 
             min="1" max="100" value="100" class="form-control">
  </div>`;
  },
  set_value:function(node,value,task,section){
      //node - an html object related to the html defined above
      //value - a value defined by the map_to property
      //task - the task object
      //section- the section's configuration object
    
  },
  get_value:function(node,task,section){
      //node - an html object related to the html defined above
      //task - the task object
      //section - the section's configuration object
      return node.querySelector(".form-control").value;
  },
  focus:function(node){
      //node - an html object related to the html defined above
  }
}

gantt.config.lightbox.sections = [
  {name: "description", height: 70, map_to: "text", type: "textarea", focus: true},
  {name: "type", type: "typeselect", map_to: "type"},
  {name: "time", type: "duration", map_to: "auto"}, 
  {name: "owner", type: "resources",map_to:"auto", options: getResourceOptions()}

];
gantt.config.lightbox.assignment_sections= [
  {name: "description", height: 70, map_to: "text", type: "textarea", focus: true},
  {name: "time", type: "duration", map_to: "auto"},
  {name: "allocation", type:"allocation_editor", map_to: "allocation"},
  {name: "owner_assignment",type: "resources",map_to: "auto", options: getResourceOptions()}
];

gantt.attachEvent("onLightboxSave", function(id, task, is_new){
  gantt.updateTask(id);
  if(task.parent != 0){
    if(!(gantt.config.task_types[gantt.getTask(task.parent).type]).includes(task.type)){
        return false;
    }
  }
  return true;
})


/********************************************STYLE********************************************************* */
gantt.templates.task_text = function(start, end, task){
  return task.type ;
}
gantt.templates.task_class = function(start, end, task){
      return task.type;
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
  { key: 1, label: "Developer" },
    { key: 2, label: "QA" },
    { key: 3, label: "PM" }
]);
 