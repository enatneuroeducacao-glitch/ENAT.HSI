import { updateCourse } from "./certificatesApi";

const COURSE_KEY="enat_certificate_course_v3";

export const teacherIdOf=lesson=>String(lesson?.teacherId||lesson?.teacher_id||lesson?.teacher?.id||"").trim();

export const readLocalCourse=()=>{
  try{
    const value=JSON.parse(localStorage.getItem(COURSE_KEY)||"null");
    return value&&Array.isArray(value.modules)?value:null;
  }catch{return null}
};

const sameCourse=(dbCourse,localCourse)=>Boolean(
  dbCourse&&localCourse&&(
    (localCourse.code&&String(dbCourse.code||"").toUpperCase()===String(localCourse.code).toUpperCase())||
    (localCourse.name&&String(dbCourse.name||"").trim()===String(localCourse.name).trim())
  )
);

export const mergeLocalAssignments=(dbCourse,localCourse)=>{
  if(!sameCourse(dbCourse,localCourse)) return {course:dbCourse,changed:false};
  const byName=new Map(
    (localCourse.modules||[]).flatMap(m=>(m.lessons||[]).map(l=>[String(l.name||"").trim().toLowerCase(),l]))
  );
  let changed=false;
  const modules=(dbCourse.modules||[]).map((m,mi)=>({
    ...m,
    lessons:(m.lessons||[]).map((l,li)=>{
      const current=teacherIdOf(l);
      if(current) return l;
      const source=byName.get(String(l.name||"").trim().toLowerCase())||localCourse.modules?.[mi]?.lessons?.[li];
      const teacherId=teacherIdOf(source);
      if(!teacherId) return {...l,teacherId:""};
      changed=true;
      return {...l,teacherId};
    })
  }));
  return {course:{...dbCourse,modules},changed};
};

export const syncCoursesWithLocalAssignments=async courses=>{
  const local=readLocalCourse();
  if(!local) return {courses,changed:false};
  let changed=false;
  const result=[];
  for(const dbCourse of courses||[]){
    const merged=mergeLocalAssignments(dbCourse,local);
    if(merged.changed&&dbCourse.id){
      await updateCourse(dbCourse.id,merged.course);
      changed=true;
    }
    result.push(merged.course);
  }
  const matched=result.find(c=>sameCourse(c,local));
  if(matched) localStorage.setItem(COURSE_KEY,JSON.stringify(matched));
  return {courses:result,changed};
};
